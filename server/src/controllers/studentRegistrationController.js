import CourseOffering from "../models/courseOfferingModel.js";
import StudentAcademicRecord from "../models/studentAcademicRecordModel.js";
import Course from "../models/courseModel.js";

/**
 * Get available courses for registration
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const { academicYear, semester, faculty, department, search } = req.query;

    const query = {
      registrationOpen: true,
      status: "active",
    };

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    // Build course filter
    let courseFilter = {};
    if (faculty) courseFilter.faculty = faculty;
    if (department) courseFilter.department = department;

    if (search) {
      courseFilter.$or = [
        { courseCode: new RegExp(search, "i") },
        { courseNameTH: new RegExp(search, "i") },
        { courseNameEN: new RegExp(search, "i") },
      ];
    }

    // Get matching courses first if we have filters
    if (Object.keys(courseFilter).length > 0) {
      const matchingCourses = await Course.find(courseFilter).select("_id");
      query.course = { $in: matchingCourses.map((c) => c._id) };
    }

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

    // Filter out full classes and add enrollment status
    const studentId = req.user._id;
    const result = offerings.map((offering) => {
      const isEnrolled = offering.students.some(
        (s) => s.toString() === studentId.toString(),
      );
      return {
        ...offering.toObject(),
        isEnrolled,
        isFull: offering.students.length >= offering.maxStudents,
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
 * Get my registered courses
 */
export const getMyRegisteredCourses = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { academicYear, semester } = req.query;

    const query = {
      students: studentId,
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
 * Enroll in a course
 */
export const enrollCourse = async (req, res) => {
  try {
    const { offeringId } = req.body;
    const studentId = req.user._id;

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

    // Check if class is full
    if (offering.students.length >= offering.maxStudents) {
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
    const studentId = req.user._id;

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
    const studentId = req.params.studentId || req.user._id;

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

    const studentId = student || req.user._id;

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
