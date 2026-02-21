import Faculty from "../models/facultyModel.js";
import Department from "../models/departmentModel.js";
import StudentClass from "../models/studentClassModel.js";
import AdvisorChangeLog from "../models/advisorChangeLogModel.js";
import User from "../models/userModel.js";

/**
 * Get all faculties
 */
export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find({ isActive: true })
      .populate("dean", "firstName lastName email")
      .sort({ code: 1 });

    res.json({
      success: true,
      data: faculties,
    });
  } catch (error) {
    console.error("Get faculties error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลคณะ",
    });
  }
};

/**
 * Get departments by faculty
 */
export const getDepartmentsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const departments = await Department.find({
      faculty: facultyId,
      isActive: true,
    })
      .populate("head", "firstName lastName email")
      .sort({ code: 1 });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสาขา",
    });
  }
};

/**
 * Get all classes by department
 */
export const getClassesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { academicYear } = req.query;

    const query = { department: departmentId, isActive: true };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const classes = await StudentClass.find(query)
      .populate("classAdvisor", "firstName lastName email")
      .populate("department", "code nameTH")
      .sort({ yearLevel: 1, section: 1 });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้องเรียน",
    });
  }
};

/**
 * Create a new class (Dept Head only)
 */
export const createClass = async (req, res) => {
  try {
    const { department, academicYear, yearLevel, section, maxStudents } =
      req.body;

    // Check if dept head has permission for this department
    if (req.user.role === "dept_head") {
      if (!req.user.department?.equals(department)) {
        return res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์สร้างห้องเรียนในสาขานี้",
        });
      }
    }

    const newClass = await StudentClass.create({
      department,
      academicYear,
      yearLevel,
      section,
      maxStudents: maxStudents || 40,
    });

    await newClass.populate("department", "code nameTH");

    res.status(201).json({
      success: true,
      message: "สร้างห้องเรียนสำเร็จ",
      data: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "ห้องเรียนนี้มีอยู่แล้ว",
      });
    }
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างห้องเรียน",
    });
  }
};

/**
 * Assign Class Advisor (Dept Head only)
 */
export const assignClassAdvisor = async (req, res) => {
  try {
    const { classId } = req.params;
    const { advisorId, reason } = req.body;

    // Get the class
    const studentClass = await StudentClass.findById(classId);
    if (!studentClass) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบห้องเรียน",
      });
    }

    // Check dept head permission
    if (req.user.role === "dept_head") {
      if (!req.user.department?.equals(studentClass.department)) {
        return res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์จัดการห้องเรียนในสาขานี้",
        });
      }
    }

    // Get the advisor user
    const advisor = await User.findById(advisorId);
    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบอาจารย์",
      });
    }

    // Store previous advisor for logging
    const previousAdvisor = studentClass.classAdvisor;

    // Update class advisor
    studentClass.classAdvisor = advisorId;
    await studentClass.save();

    // Update user flag
    await User.findByIdAndUpdate(advisorId, { isClassAdvisor: true });

    // Log the change
    await AdvisorChangeLog.create({
      action: previousAdvisor ? "transferred" : "assigned",
      instructor: advisorId,
      studentClass: classId,
      previousAdvisor: previousAdvisor || null,
      changedBy: req.user._id,
      reason: reason || "",
      academicYear: studentClass.academicYear,
    });

    await studentClass.populate("classAdvisor", "firstName lastName email");

    res.json({
      success: true,
      message: "แต่งตั้งอาจารย์ประจำห้องสำเร็จ",
      data: studentClass,
    });
  } catch (error) {
    console.error("Assign advisor error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแต่งตั้งอาจารย์ประจำห้อง",
    });
  }
};

/**
 * Remove Class Advisor (Dept Head only)
 */
export const removeClassAdvisor = async (req, res) => {
  try {
    const { classId } = req.params;
    const { reason } = req.body;

    const studentClass = await StudentClass.findById(classId);
    if (!studentClass) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบห้องเรียน",
      });
    }

    // Check dept head permission
    if (req.user.role === "dept_head") {
      if (!req.user.department?.equals(studentClass.department)) {
        return res.status(403).json({
          success: false,
          message: "คุณไม่มีสิทธิ์จัดการห้องเรียนในสาขานี้",
        });
      }
    }

    if (!studentClass.classAdvisor) {
      return res.status(400).json({
        success: false,
        message: "ห้องเรียนนี้ไม่มีอาจารย์ประจำห้อง",
      });
    }

    const removedAdvisorId = studentClass.classAdvisor;

    // Log the removal
    await AdvisorChangeLog.create({
      action: "removed",
      instructor: removedAdvisorId,
      studentClass: classId,
      changedBy: req.user._id,
      reason: reason || "",
      academicYear: studentClass.academicYear,
    });

    // Remove advisor from class
    studentClass.classAdvisor = null;
    await studentClass.save();

    // Check if instructor still has other classes
    const otherClasses = await StudentClass.countDocuments({
      classAdvisor: removedAdvisorId,
    });

    if (otherClasses === 0) {
      await User.findByIdAndUpdate(removedAdvisorId, { isClassAdvisor: false });
    }

    res.json({
      success: true,
      message: "ถอดถอนอาจารย์ประจำห้องสำเร็จ",
    });
  } catch (error) {
    console.error("Remove advisor error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการถอดถอนอาจารย์ประจำห้อง",
    });
  }
};

/**
 * Get advisor change history for a class
 */
export const getAdvisorHistory = async (req, res) => {
  try {
    const { classId } = req.params;

    const history = await AdvisorChangeLog.getClassHistory(classId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get advisor history error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงประวัติ",
    });
  }
};

/**
 * Add students to class
 */
export const addStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;

    const studentClass = await StudentClass.findById(classId);
    if (!studentClass) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบห้องเรียน",
      });
    }

    // Check capacity
    const currentCount = studentClass.students.length;
    const newCount = currentCount + studentIds.length;

    if (newCount > studentClass.maxStudents) {
      return res.status(400).json({
        success: false,
        message: `ห้องเรียนเต็ม (รับได้ ${studentClass.maxStudents} คน)`,
      });
    }

    // Add students (avoid duplicates)
    const existingIds = studentClass.students.map((s) => s.toString());
    const newStudents = studentIds.filter((id) => !existingIds.includes(id));

    studentClass.students.push(...newStudents);
    await studentClass.save();

    res.json({
      success: true,
      message: `เพิ่มนักศึกษา ${newStudents.length} คนสำเร็จ`,
      data: {
        added: newStudents.length,
        total: studentClass.students.length,
      },
    });
  } catch (error) {
    console.error("Add students error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มนักศึกษา",
    });
  }
};

/**
 * Get instructors available for advisor assignment
 */
export const getAvailableInstructors = async (req, res) => {
  try {
    const { departmentId } = req.query;

    const query = { role: "instructor" };
    if (departmentId) {
      query.department = departmentId;
    }

    const instructors = await User.find(query)
      .select("firstName lastName email isClassAdvisor department")
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
      message: "เกิดข้อผิดพลาดในการดึงรายชื่ออาจารย์",
    });
  }
};
