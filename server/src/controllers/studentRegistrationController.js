import mongoose from "mongoose";
import CourseOffering from "../models/courseOfferingModel.js";
import StudentAcademicRecord from "../models/studentAcademicRecordModel.js";
import Course from "../models/courseModel.js";

const MAX_CREDITS = 21;

// Helper: cast string → ObjectId safely
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

/**
 * Get available courses for registration (Shopping Cart)
 * แสดงเฉพาะ offerings ที่นักศึกษาอยู่ใน eligibleStudents[]
 * + offerings ที่ enrolled อยู่แล้ว (เพื่อแสดงสถานะ)
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const { academicYear, semester, search } = req.query;
    const studentId = req.user.id;

    // Build query: หา offerings ที่ student eligible หรือ enrolled อยู่แล้ว
    const query = {
      status: "active",
      $or: [
        { eligibleStudents: studentId },
        { students: studentId },
      ],
    };

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    let offerings = await CourseOffering.find(query)
      .populate({
        path: "course",
        select: "courseCode courseNameTH courseNameEN credits courseType",
        populate: [
          { path: "faculty", select: "code nameTH" },
          { path: "department", select: "code nameTH" },
        ],
      })
      .populate("instructor", "firstName lastName")
      .sort({ "course.courseCode": 1 });

    // Apply search filter if provided
    if (search) {
      const s = search.toLowerCase();
      offerings = offerings.filter((o) => {
        const code = o.course?.courseCode || "";
        const nameTH = o.course?.courseNameTH || "";
        const nameEN = o.course?.courseNameEN || "";
        return (
          code.toLowerCase().includes(s) ||
          nameTH.toLowerCase().includes(s) ||
          nameEN.toLowerCase().includes(s)
        );
      });
    }

    // Map result with enrollment status flags
    const result = offerings.map((offering) => {
      const isEnrolled = offering.students.some(
        (s) => s.toString() === studentId.toString(),
      );
      const isEligible = offering.eligibleStudents.some(
        (s) => s.toString() === studentId.toString(),
      );
      const totalOccupied =
        (offering.students?.length || 0) +
        (offering.eligibleStudents?.length || 0);

      return {
        ...offering.toObject(),
        isEnrolled,
        isEligible,
        isFull: totalOccupied >= offering.maxStudents,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get available courses error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา",
    });
  }
};

/**
 * Get my registered courses (enrolled only — ยืนยันแล้ว)
 */
export const getMyRegisteredCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academicYear, semester } = req.query;

    const query = {
      students: studentId,
      status: { $ne: "cancelled" },
    };

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    const offerings = await CourseOffering.find(query)
      .populate({
        path: "course",
        select: "courseCode courseNameTH courseNameEN credits courseType",
        populate: [
          { path: "faculty", select: "code nameTH" },
          { path: "department", select: "code nameTH" },
        ],
      })
      .populate("instructor", "firstName lastName")
      .sort({ "course.courseCode": 1 });

    // Calculate total credits
    const totalCredits = offerings.reduce(
      (sum, o) => sum + (o.course?.credits || 0),
      0,
    );

    res.json({
      success: true,
      data: {
        courses: offerings,
        totalCredits,
        count: offerings.length,
      },
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา",
    });
  }
};

/**
 * Confirm registration — Shopping Cart checkout (Batch)
 * ย้าย student จาก eligibleStudents[] → students[]
 * Validate:
 * 1. ทุก offering ต้องมี student อยู่ใน eligibleStudents
 * 2. Total credits (ที่ enroll อยู่แล้ว + ที่จะ confirm ใหม่) ≤ 21
 * 3. No schedule conflicts
 */
export const confirmRegistration = async (req, res) => {
  try {
    const { offeringIds } = req.body;
    const studentId = req.user.id;

    if (
      !offeringIds ||
      !Array.isArray(offeringIds) ||
      offeringIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกอย่างน้อย 1 วิชา",
      });
    }

    // Fetch all requested offerings
    const offerings = await CourseOffering.find({
      _id: { $in: offeringIds },
      status: "active",
    }).populate("course", "courseCode courseNameTH credits");

    if (offerings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียนที่เลือก",
      });
    }

    // 1. Validate: ทุก offering ต้องมี student อยู่ใน eligibleStudents
    const notEligible = [];
    const alreadyEnrolled = [];
    const toConfirm = [];

    for (const offering of offerings) {
      const isEnrolled = offering.students.some(
        (s) => s.toString() === studentId.toString(),
      );
      if (isEnrolled) {
        alreadyEnrolled.push(offering);
        continue;
      }

      const isEligible = offering.eligibleStudents.some(
        (s) => s.toString() === studentId.toString(),
      );
      if (!isEligible) {
        notEligible.push(offering);
        continue;
      }

      toConfirm.push(offering);
    }

    if (notEligible.length > 0) {
      return res.status(403).json({
        success: false,
        message: `คุณไม่ได้รับสิทธิ์ลงวิชา: ${notEligible.map((o) => o.course?.courseCode).join(", ")}`,
      });
    }

    // 2. Validate: Total credits ≤ MAX_CREDITS
    // Get already enrolled courses for this semester
    const sampleOffering = toConfirm[0] || alreadyEnrolled[0];
    if (!sampleOffering) {
      return res.status(400).json({
        success: false,
        message: "ไม่มีวิชาใหม่ที่ต้องยืนยัน",
      });
    }

    const existingEnrolled = await CourseOffering.find({
      students: studentId,
      academicYear: sampleOffering.academicYear,
      semester: sampleOffering.semester,
      status: "active",
    }).populate("course", "credits courseCode");

    const existingCredits = existingEnrolled.reduce(
      (sum, o) => sum + (o.course?.credits || 0),
      0,
    );
    const newCredits = toConfirm.reduce(
      (sum, o) => sum + (o.course?.credits || 0),
      0,
    );
    const totalCredits = existingCredits + newCredits;

    if (totalCredits > MAX_CREDITS) {
      return res.status(400).json({
        success: false,
        message: `หน่วยกิตรวมเกินกำหนด (${totalCredits}/${MAX_CREDITS}) — ปัจจุบันลงแล้ว ${existingCredits} หน่วยกิต, ต้องการเพิ่ม ${newCredits} หน่วยกิต`,
      });
    }

    // 3. Validate: No schedule conflicts
    // Combine existing enrolled schedules + new toConfirm schedules
    const allScheduleOfferings = [...existingEnrolled, ...toConfirm];
    for (let i = 0; i < allScheduleOfferings.length; i++) {
      for (let j = i + 1; j < allScheduleOfferings.length; j++) {
        const a = allScheduleOfferings[i];
        const b = allScheduleOfferings[j];
        for (const slotA of a.schedule || []) {
          for (const slotB of b.schedule || []) {
            if (slotA.day === slotB.day) {
              if (
                slotA.startTime < slotB.endTime &&
                slotA.endTime > slotB.startTime
              ) {
                return res.status(400).json({
                  success: false,
                  message: `ตารางเรียนชนกัน: ${a.course?.courseCode || "?"} กับ ${b.course?.courseCode || "?"}`,
                });
              }
            }
          }
        }
      }
    }

    // 4. Execute: Move from eligibleStudents → students
    const results = { confirmed: [], failed: [] };

    for (const offering of toConfirm) {
      try {
        // Check seat availability (someone else might have taken the seat)
        const totalOccupied = offering.students.length;
        if (totalOccupied >= offering.maxStudents) {
          results.failed.push({
            courseCode: offering.course?.courseCode,
            reason: "ที่นั่งเต็มแล้ว",
          });
          continue;
        }

        // Atomic update: pull from eligible, push to students
        // ต้อง cast เป็น ObjectId เพราะ req.user.id เป็น string จาก JWT
        const studentObjectId = toObjectId(studentId);
        await CourseOffering.findByIdAndUpdate(offering._id, {
          $pull: { eligibleStudents: studentObjectId },
          $push: { students: studentObjectId },
        });

        results.confirmed.push({
          courseCode: offering.course?.courseCode,
          courseName: offering.course?.courseNameTH,
        });
      } catch (err) {
        results.failed.push({
          courseCode: offering.course?.courseCode,
          reason: err.message,
        });
      }
    }

    const allSuccess = results.failed.length === 0;

    res.json({
      success: true,
      message: allSuccess
        ? `ลงทะเบียนสำเร็จทั้ง ${results.confirmed.length} วิชา!`
        : `ลงทะเบียนสำเร็จ ${results.confirmed.length} วิชา, ล้มเหลว ${results.failed.length} วิชา`,
      data: {
        confirmed: results.confirmed,
        alreadyEnrolled: alreadyEnrolled.map((o) => ({
          courseCode: o.course?.courseCode,
        })),
        failed: results.failed,
        totalCredits: existingCredits + newCredits,
      },
    });
  } catch (error) {
    console.error("Confirm registration error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยืนยันลงทะเบียน",
    });
  }
};

/**
 * Enroll in a course (legacy + direct enroll for open-registration courses)
 */
export const enrollCourse = async (req, res) => {
  try {
    const { offeringId } = req.body;
    const studentId = req.user.id;

    const offering = await CourseOffering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    // Check if registration is open
    if (!offering.registrationOpen) {
      return res.status(400).json({
        success: false,
        message: "ยังไม่เปิดลงทะเบียนสำหรับกลุ่มนี้",
      });
    }

    // Check if already enrolled
    if (offering.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "คุณลงทะเบียนวิชานี้แล้ว",
      });
    }

    // Check if class is full (enrolled + eligible)
    const totalOccupied =
      offering.students.length + offering.eligibleStudents.length;
    if (totalOccupied >= offering.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "กลุ่มเรียนเต็มแล้ว",
      });
    }

    // Check for schedule conflicts
    const existingCourses = await CourseOffering.find({
      students: studentId,
      academicYear: offering.academicYear,
      semester: offering.semester,
    });

    for (const existing of existingCourses) {
      for (const newSlot of offering.schedule) {
        for (const existingSlot of existing.schedule) {
          if (newSlot.day === existingSlot.day) {
            const newStart = newSlot.startTime;
            const newEnd = newSlot.endTime;
            const existingStart = existingSlot.startTime;
            const existingEnd = existingSlot.endTime;

            // Check time overlap
            if (newStart < existingEnd && newEnd > existingStart) {
              const conflictCourse = await Course.findById(existing.course);
              return res.status(400).json({
                success: false,
                message: `ตารางเรียนชนกับวิชา ${conflictCourse?.courseCode || "อื่น"}`,
              });
            }
          }
        }
      }
    }

    // Enroll student
    offering.students.push(studentId);
    // Also remove from eligibleStudents if present
    offering.eligibleStudents = offering.eligibleStudents.filter(
      (s) => s.toString() !== studentId.toString(),
    );
    await offering.save();

    await offering.populate([
      { path: "course", select: "courseCode courseNameTH credits" },
      { path: "instructor", select: "firstName lastName" },
    ]);

    res.json({
      success: true,
      message: "ลงทะเบียนสำเร็จ",
      data: offering,
    });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลงทะเบียน",
    });
  }
};

/**
 * Drop a course
 */
export const dropCourse = async (req, res) => {
  try {
    const { offeringId } = req.params;
    const studentId = req.user.id;

    const offering = await CourseOffering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    // Check if enrolled
    const studentIndex = offering.students.findIndex(
      (s) => s.toString() === studentId.toString(),
    );

    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "คุณไม่ได้ลงทะเบียนวิชานี้",
      });
    }

    // Check if registration is still open
    if (!offering.registrationOpen) {
      return res.status(400).json({
        success: false,
        message: "หมดเวลาถอนวิชาแล้ว",
      });
    }

    // Remove student
    offering.students.splice(studentIndex, 1);
    await offering.save();

    res.json({
      success: true,
      message: "ถอนวิชาสำเร็จ",
    });
  } catch (error) {
    console.error("Drop course error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการถอนวิชา",
    });
  }
};

/**
 * Get student academic records (8-year history)
 */
export const getAcademicRecords = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    const records = await StudentAcademicRecord.getStudentHistory(studentId);
    const canAddNew = await StudentAcademicRecord.canAddNewYear(studentId);
    const remainingYears =
      await StudentAcademicRecord.getRemainingYears(studentId);

    res.json({
      success: true,
      data: {
        records,
        canAddNewYear: canAddNew,
        remainingYears,
        totalYears: records.length,
        maxYears: 8,
      },
    });
  } catch (error) {
    console.error("Get academic records error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงประวัติการศึกษา",
    });
  }
};

/**
 * Add academic record for a year
 */
export const addAcademicRecord = async (req, res) => {
  try {
    const { student, academicYear, yearLevel, faculty, department, status } =
      req.body;

    const studentId = student || req.user.id;

    // Check 8-year limit
    const canAdd = await StudentAcademicRecord.canAddNewYear(studentId);
    if (!canAdd) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถเพิ่มปีการศึกษาได้ (ครบ 8 ปีแล้ว)",
      });
    }

    const record = await StudentAcademicRecord.create({
      student: studentId,
      academicYear,
      yearLevel,
      faculty,
      department,
      status: status || "enrolled",
    });

    await record.populate([
      { path: "faculty", select: "code nameTH" },
      { path: "department", select: "code nameTH" },
    ]);

    res.status(201).json({
      success: true,
      message: "เพิ่มปีการศึกษาสำเร็จ",
      data: record,
    });
  } catch (error) {
    console.error("Add academic record error:", error);

    if (error.code === "MAX_YEARS_EXCEEDED" || error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: error.message || "ปีการศึกษานี้มีอยู่แล้ว",
      });
    }

    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มปีการศึกษา",
    });
  }
};
