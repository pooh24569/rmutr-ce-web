import Course from "../models/courseModel.js";
import CourseOffering from "../models/courseOfferingModel.js";
import User from "../models/userModel.js";

/**
 * Get all courses (with filters)
 */
export const getAllCourses = async (req, res) => {
  try {
    const { faculty, department, status, search } = req.query;

    const query = {};

    // Apply faculty scope for faculty_registrar
    if (req.user.role === "faculty_registrar") {
      query.faculty = req.user.faculty;
    } else if (faculty) {
      query.faculty = faculty;
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { courseCode: new RegExp(search, "i") },
        { courseNameTH: new RegExp(search, "i") },
        { courseNameEN: new RegExp(search, "i") },
      ];
    }

    const courses = await Course.find(query)
      .populate("faculty", "code nameTH")
      .populate("department", "code nameTH")
      .populate("prerequisites", "courseCode courseNameTH")
      .populate("createdBy", "firstName lastName")
      .sort({ courseCode: 1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา",
    });
  }
};

/**
 * Get single course
 */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("faculty", "code nameTH")
      .populate("department", "code nameTH")
      .populate("prerequisites", "courseCode courseNameTH")
      .populate("createdBy", "firstName lastName");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา",
    });
  }
};

/**
 * Create new course (Registrar only)
 */
export const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseNameTH,
      courseNameEN,
      credits,
      faculty,
      department,
      description,
      prerequisites,
      courseType,
    } = req.body;

    // Faculty registrar can only create courses in their faculty
    if (req.user.role === "faculty_registrar") {
      if (!req.user.faculty?.equals(faculty)) {
        return res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์สร้างรายวิชาในคณะนี้",
        });
      }
    }

    const course = await Course.create({
      courseCode,
      courseNameTH,
      courseNameEN,
      credits,
      faculty,
      department,
      description,
      prerequisites: prerequisites || [],
      courseType: courseType || "required",
      createdBy: req.user._id,
    });

    await course.populate([
      { path: "faculty", select: "code nameTH" },
      { path: "department", select: "code nameTH" },
    ]);

    res.status(201).json({
      success: true,
      message: "สร้างรายวิชาสำเร็จ",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "รหัสวิชานี้มีอยู่แล้ว",
      });
    }
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างรายวิชา",
    });
  }
};

/**
 * Update course (Registrar only)
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // Faculty registrar can only update courses in their faculty
    if (req.user.role === "faculty_registrar") {
      if (!req.user.faculty?.equals(course.faculty)) {
        return res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์แก้ไขรายวิชาในคณะนี้",
        });
      }
    }

    Object.assign(course, updates);
    await course.save();

    await course.populate([
      { path: "faculty", select: "code nameTH" },
      { path: "department", select: "code nameTH" },
    ]);

    res.json({
      success: true,
      message: "แก้ไขรายวิชาสำเร็จ",
      data: course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแก้ไขรายวิชา",
    });
  }
};

/**
 * Delete/Deactivate course (Registrar only)
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // Faculty registrar can only delete courses in their faculty
    if (req.user.role === "faculty_registrar") {
      if (!req.user.faculty?.equals(course.faculty)) {
        return res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์ลบรายวิชาในคณะนี้",
        });
      }
    }

    // Soft delete - set status to inactive
    course.status = "inactive";
    await course.save();

    res.json({
      success: true,
      message: "ปิดรายวิชาสำเร็จ",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบรายวิชา",
    });
  }
};

// ===== Course Offering (Section) Management =====

/**
 * Get course offerings
 */
export const getCourseOfferings = async (req, res) => {
  try {
    const { academicYear, semester, course, instructor, registrationOpen } =
      req.query;

    const query = {};

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (course) query.course = course;
    if (instructor) query.instructor = instructor;
    if (registrationOpen !== undefined) {
      query.registrationOpen = registrationOpen === "true";
    }

    const offerings = await CourseOffering.find(query)
      .populate({
        path: "course",
        select: "courseCode courseNameTH credits",
        populate: [
          { path: "faculty", select: "code nameTH" },
          { path: "department", select: "code nameTH" },
        ],
      })
      .populate("instructor", "firstName lastName email")
      .sort({ academicYear: -1, semester: 1, section: 1 });

    res.json({
      success: true,
      data: offerings,
    });
  } catch (error) {
    console.error("Get offerings error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มเรียน",
    });
  }
};

/**
 * Create course offering (Registrar only)
 */
export const createCourseOffering = async (req, res) => {
  try {
    const {
      course,
      instructor,
      academicYear,
      semester,
      section,
      maxStudents,
      schedule,
      registrationOpen,
    } = req.body;

    // Validate instructor exists and is an instructor
    const instructorUser = await User.findById(instructor);
    if (!instructorUser) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบอาจารย์",
      });
    }

    const offering = await CourseOffering.create({
      course,
      instructor,
      academicYear,
      semester,
      section,
      maxStudents: maxStudents || 40,
      schedule: schedule || [],
      registrationOpen: registrationOpen || false,
      createdBy: req.user._id,
    });

    await offering.populate([
      {
        path: "course",
        select: "courseCode courseNameTH credits",
      },
      {
        path: "instructor",
        select: "firstName lastName email",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "เปิดกลุ่มเรียนสำเร็จ",
      data: offering,
    });
  } catch (error) {
    console.error("Create offering error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "กลุ่มเรียนนี้มีอยู่แล้ว",
      });
    }
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปิดกลุ่มเรียน",
    });
  }
};

/**
 * Update course offering
 */
export const updateCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const offering = await CourseOffering.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("course", "courseCode courseNameTH credits")
      .populate("instructor", "firstName lastName email");

    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    res.json({
      success: true,
      message: "แก้ไขกลุ่มเรียนสำเร็จ",
      data: offering,
    });
  } catch (error) {
    console.error("Update offering error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแก้ไขกลุ่มเรียน",
    });
  }
};

/**
 * Toggle registration open/close
 */
export const toggleRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    offering.registrationOpen = !offering.registrationOpen;
    await offering.save();

    res.json({
      success: true,
      message: offering.registrationOpen
        ? "เปิดลงทะเบียนแล้ว"
        : "ปิดลงทะเบียนแล้ว",
      data: { registrationOpen: offering.registrationOpen },
    });
  } catch (error) {
    console.error("Toggle registration error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

// ===== Instructor List (for dropdown) =====

/**
 * Get all instructors (for assigning to course offerings)
 */
export const getInstructors = async (req, res) => {
  try {
    const { faculty, search } = req.query;
    const query = { role: "instructor" };

    if (faculty) {
      query.faculty = faculty;
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { username: new RegExp(search, "i") },
      ];
    }

    const instructors = await User.find(query)
      .select("_id username email firstName lastName faculty department")
      .populate("faculty", "code nameTH")
      .populate("department", "code nameTH")
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    console.error("Get instructors error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลอาจารย์",
    });
  }
};

// ===== Enrollment Management =====

/**
 * Enroll students to a course offering
 */
export const enrollStudentsToOffering = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายชื่อนักศึกษา",
      });
    }

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    // Find students by username or ObjectId
    const students = await User.find({
      role: "student",
      $or: [
        { _id: { $in: studentIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
        { username: { $in: studentIds } },
      ],
    });

    const results = { added: [], alreadyExists: [], notFound: [] };

    const foundUsernames = students.map((s) => s.username);
    const foundIds = students.map((s) => s._id.toString());

    results.notFound = studentIds.filter(
      (id) => !foundUsernames.includes(id) && !foundIds.includes(id),
    );

    for (const student of students) {
      const alreadyEnrolled = offering.students.some(
        (s) => s.toString() === student._id.toString(),
      );

      if (alreadyEnrolled) {
        results.alreadyExists.push({
          username: student.username,
          name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        });
      } else {
        offering.students.push(student._id);
        results.added.push({
          username: student.username,
          name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        });
      }
    }

    // Check capacity
    if (offering.students.length > offering.maxStudents) {
      return res.status(400).json({
        success: false,
        message: `จำนวนนักศึกษาเกินจำนวนที่นั่ง (สูงสุด ${offering.maxStudents} คน)`,
      });
    }

    await offering.save();

    res.json({
      success: true,
      message: `เพิ่มนักศึกษาสำเร็จ ${results.added.length} คน`,
      data: {
        added: results.added,
        alreadyExists: results.alreadyExists,
        notFound: results.notFound,
        summary: {
          total: studentIds.length,
          added: results.added.length,
          alreadyExists: results.alreadyExists.length,
          notFound: results.notFound.length,
        },
      },
    });
  } catch (error) {
    console.error("Enroll students error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลงทะเบียนนักศึกษา",
    });
  }
};

/**
 * Remove student from course offering
 */
export const removeStudentFromOffering = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    offering.students = offering.students.filter(
      (s) => s.toString() !== studentId,
    );
    await offering.save();

    res.json({
      success: true,
      message: "ลบนักศึกษาออกจากกลุ่มเรียนสำเร็จ",
    });
  } catch (error) {
    console.error("Remove student error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * Update course offering schedule
 */
export const updateOfferingSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุตารางเรียน",
      });
    }

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    offering.schedule = schedule;
    await offering.save();

    await offering.populate([
      { path: "course", select: "courseCode courseNameTH credits" },
      { path: "instructor", select: "firstName lastName email" },
    ]);

    res.json({
      success: true,
      message: "อัปเดตตารางเรียนสำเร็จ",
      data: offering,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตตารางเรียน",
    });
  }
};

/**
 * Get single course offering with full details
 */
export const getCourseOfferingById = async (req, res) => {
  try {
    const { id } = req.params;

    const offering = await CourseOffering.findById(id)
      .populate({
        path: "course",
        select: "courseCode courseNameTH courseNameEN credits courseType",
        populate: [
          { path: "faculty", select: "code nameTH" },
          { path: "department", select: "code nameTH" },
        ],
      })
      .populate("instructor", "firstName lastName email username")
      .populate("students", "username email firstName lastName");

    if (!offering) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบกลุ่มเรียน",
      });
    }

    res.json({
      success: true,
      data: offering,
    });
  } catch (error) {
    console.error("Get offering error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มเรียน",
    });
  }
};

/**
 * Get offerings where current user is the instructor
 */
export const getMyTeachingOfferings = async (req, res) => {
  try {
    const offerings = await CourseOffering.find({
      instructor: req.user._id,
      status: "active",
    })
      .populate({
        path: "course",
        select: "courseCode courseNameTH courseNameEN credits courseType",
        populate: [
          { path: "faculty", select: "code nameTH" },
          { path: "department", select: "code nameTH" },
        ],
      })
      .populate("students", "username firstName lastName email")
      .sort({ academicYear: -1, semester: 1 });

    res.json({
      success: true,
      data: offerings,
      message: `พบ ${offerings.length} รายวิชาที่สอน`,
    });
  } catch (error) {
    console.error("Get my teaching offerings error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชาที่สอน",
    });
  }
};
