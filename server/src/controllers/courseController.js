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
