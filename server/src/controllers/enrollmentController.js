import Enrollment from "../models/enrollmentModel.js";
import Class from "../models/classModel.js";
import { logger } from "../utils/logger.js";

/**
 * ดึงวิชาที่เปิดให้ลงทะเบียน (วิชาทั้งหมดที่ active)
 * GET /api/enrollments/available
 */
export const getAvailableClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // ดึงวิชาทั้งหมดที่ active
    const classes = await Class.find({ isActive: true })
      .populate("teacher", "firstName lastName email")
      .sort({ createdAt: -1 });

    // ดึงวิชาที่นักศึกษาลงทะเบียนแล้ว
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "enrolled",
    });
    const enrolledClassIds = enrollments.map((e) => e.class.toString());

    // เพิ่ม flag ว่าลงทะเบียนแล้วหรือยัง
    const classesWithEnrollment = classes.map((c) => ({
      ...c.toObject(),
      isEnrolled: enrolledClassIds.includes(c._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      data: classesWithEnrollment,
      message: `พบ ${classes.length} วิชาที่เปิดให้ลงทะเบียน`,
    });
  } catch (error) {
    logger.error("Error fetching available classes:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ดึงวิชาที่ลงทะเบียนแล้ว
 * GET /api/enrollments/my
 */
export const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({
      student: studentId,
      status: "enrolled",
    })
      .populate({
        path: "class",
        populate: {
          path: "teacher",
          select: "firstName lastName email",
        },
      })
      .sort({ enrolledAt: -1 });

    // ✅ FIX: Filter out enrollments where class was deleted (null)
    const classes = enrollments
      .filter((e) => e.class != null)
      .map((e) => ({
        ...e.class.toObject(),
        enrolledAt: e.enrolledAt,
        enrollmentId: e._id,
      }));

    return res.status(200).json({
      success: true,
      data: classes,
      message: `ลงทะเบียนแล้ว ${classes.length} วิชา`,
    });
  } catch (error) {
    logger.error("Error fetching my enrollments:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ลงทะเบียนวิชา
 * POST /api/enrollments/:classId
 */
export const enrollClass = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;

    // ตรวจสอบว่าวิชามีอยู่จริง
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบวิชานี้",
      });
    }

    // ✅ FIX: Use findOneAndUpdate to prevent race condition
    // Note: enrolledAt only in $setOnInsert to avoid ConflictingUpdateOperators error
    const result = await Enrollment.findOneAndUpdate(
      { student: studentId, class: classId },
      {
        $setOnInsert: {
          student: studentId,
          class: classId,
          enrolledAt: new Date(),
        },
        $set: {
          status: "enrolled",
        },
      },
      {
        upsert: true,
        new: true,
        rawResult: true, // Get info about whether document was inserted
      }
    );

    const enrollment = result.value;
    const wasInserted = !result.lastErrorObject?.updatedExisting;

    // ถ้าเป็นการ upsert ใหม่ หรือเปลี่ยนจาก dropped เป็น enrolled
    if (wasInserted || result.lastErrorObject?.updatedExisting) {
      // เพิ่มนักศึกษาเข้าใน Class (ถ้ายังไม่มี)
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: studentId },
      });
    }

    return res.status(wasInserted ? 201 : 200).json({
      success: true,
      data: enrollment,
      message: "ลงทะเบียนวิชาสำเร็จ",
    });
  } catch (error) {
    logger.error("Error enrolling class:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลงทะเบียน",
    });
  }
};

/**
 * ยกเลิกลงทะเบียนวิชา
 * DELETE /api/enrollments/:classId
 */
export const dropClass = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      class: classId,
      status: "enrolled",
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "คุณไม่ได้ลงทะเบียนวิชานี้",
      });
    }

    // เปลี่ยนสถานะเป็น dropped
    enrollment.status = "dropped";
    await enrollment.save();

    // ลบนักศึกษาออกจาก Class
    await Class.findByIdAndUpdate(classId, {
      $pull: { students: studentId },
    });

    return res.status(200).json({
      success: true,
      message: "ยกเลิกลงทะเบียนสำเร็จ",
    });
  } catch (error) {
    logger.error("Error dropping class:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยกเลิกลงทะเบียน",
    });
  }
};
