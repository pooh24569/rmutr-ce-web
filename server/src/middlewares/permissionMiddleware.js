import User from "../models/userModel.js";
import StudentClass from "../models/studentClassModel.js";
import CourseOffering from "../models/courseOfferingModel.js";
import Enrollment from "../models/enrollmentModel.js";
import StudentProfile from "../models/studentProfileModel.js";


const ROLE_HIERARCHY = {
  superadmin: 100,
  admin: 90,
  central_registrar: 80,
  faculty_registrar: 70,
  dept_head: 60,
  instructor: 50,
  parent: 40,
  student: 30,
};


export const hasMinRole = (userRole, requiredRole) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
};

/**
 * Check if user can access student data based on their role
 */
export const canAccessStudentData = async (userId, targetStudentId) => {
  const user = await User.findById(userId);
  if (!user) return false;

  // Superadmin and Admin can access all
  if (["superadmin", "admin"].includes(user.role)) {
    return true;
  }

  // Central Registrar can access all students
  if (user.role === "central_registrar") {
    return true;
  }

  // Student can only access own data
  if (user.role === "student") {
    return userId.toString() === targetStudentId.toString();
  }

  // Parent can access linked students
  if (user.role === "parent") {
    const profile = await StudentProfile.findOne({ userId: targetStudentId });
    if (!profile) return false;

    // Check if parent is linked via father/mother/guardian nationalId
    // This requires the parent's nationalId to be stored somewhere
    // For now, return false - implement based on your parent linking logic
    return false;
  }

  // Instructor can access students in their classes
  if (user.role === "instructor") {
    // Check course offerings (subject teaching)
    const offerings = await CourseOffering.find({ instructor: userId });
    if (offerings.length > 0) {
      const enrollments = await Enrollment.find({
        class: { $in: offerings.map((o) => o._id) },
        student: targetStudentId,
        status: "enrolled",
      });
      if (enrollments.length > 0) return true;
    }

    // Check if class advisor
    if (user.isClassAdvisor) {
      const advisorClasses = await StudentClass.find({
        classAdvisor: userId,
        students: targetStudentId,
      });
      if (advisorClasses.length > 0) return true;
    }

    return false;
  }

  // Dept Head can access all students in their department
  if (user.role === "dept_head") {
    const studentProfile = await StudentProfile.findOne({
      userId: targetStudentId,
    });
    // Check if student is in dept head's department
    const studentClass = await StudentClass.findOne({
      students: targetStudentId,
      department: user.department,
    });
    return !!studentClass;
  }

  // Faculty Registrar can access all students in their faculty
  if (user.role === "faculty_registrar") {
    const studentClass = await StudentClass.findOne({
      students: targetStudentId,
    }).populate("department");
    if (studentClass && studentClass.department) {
      return studentClass.department.faculty?.equals(user.faculty);
    }
    return false;
  }

  return false;
};

/**
 * Middleware: Require specific role(s)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบ",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
      });
    }

    next();
  };
};

/**
 * Middleware: Require minimum role level
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบ",
      });
    }

    if (!hasMinRole(req.user.role, minRole)) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
      });
    }

    next();
  };
};

/**
 * Middleware: Check faculty scope
 */
export const requireFacultyScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "กรุณาเข้าสู่ระบบ",
    });
  }

  // Superadmin, admin, central_registrar can access all faculties
  if (["superadmin", "admin", "central_registrar"].includes(req.user.role)) {
    return next();
  }

  // Others must have faculty scope
  if (!req.user.faculty) {
    return res.status(403).json({
      success: false,
      message: "ไม่พบข้อมูลคณะที่สังกัด",
    });
  }

  // Store faculty scope in request for later use
  req.facultyScope = req.user.faculty;
  next();
};

/**
 * Middleware: Check department scope
 */
export const requireDepartmentScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "กรุณาเข้าสู่ระบบ",
    });
  }

  // Superadmin, admin, central_registrar can access all departments
  if (["superadmin", "admin", "central_registrar"].includes(req.user.role)) {
    return next();
  }

  // Faculty registrar can access all departments in their faculty
  if (req.user.role === "faculty_registrar") {
    req.facultyScope = req.user.faculty;
    return next();
  }

  // Others must have department scope
  if (!req.user.department) {
    return res.status(403).json({
      success: false,
      message: "ไม่พบข้อมูลสาขาที่สังกัด",
    });
  }

  req.departmentScope = req.user.department;
  next();
};

/**
 * Middleware: Check if user is class advisor
 */
export const requireClassAdvisor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "กรุณาเข้าสู่ระบบ",
    });
  }

  // Superadmin/admin can pass
  if (["superadmin", "admin"].includes(req.user.role)) {
    return next();
  }

  if (!req.user.isClassAdvisor) {
    return res.status(403).json({
      success: false,
      message: "คุณไม่ใช่อาจารย์ประจำห้อง",
    });
  }

  next();
};

/**
 * Middleware: Dept head only (for advisor management)
 */
export const requireDeptHead = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "กรุณาเข้าสู่ระบบ",
    });
  }

  const allowedRoles = ["superadmin", "admin", "dept_head"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "เฉพาะหัวหน้าสาขาเท่านั้นที่สามารถดำเนินการนี้ได้",
    });
  }

  next();
};

export default {
  hasMinRole,
  canAccessStudentData,
  requireRole,
  requireMinRole,
  requireFacultyScope,
  requireDepartmentScope,
  requireClassAdvisor,
  requireDeptHead,
};
