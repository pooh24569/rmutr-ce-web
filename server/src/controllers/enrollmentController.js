import Enrollment from "../models/enrollmentModel.js";
import Class from "../models/classModel.js";
import { logger } from "../utils/logger.js";

export const getAvailableClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const classes = await Class.find({ isActive: true })
      .populate("teacher", "firstName lastName email")
      .sort({ createdAt: -1 });

    const enrollments = await Enrollment.find({
      student: studentId,
      status: "enrolled",
    });
    const enrolledClassIds = enrollments.map((e) => e.class.toString());

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

export const enrollClass = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.params;

    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบวิชานี้",
      });
    }

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
        rawResult: true,
      }
    );

    const enrollment = result.value;
    const wasInserted = !result.lastErrorObject?.updatedExisting;

    if (wasInserted || result.lastErrorObject?.updatedExisting) {

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

    enrollment.status = "dropped";
    await enrollment.save();

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
