import express from "express";
import {
  getAllFaculties,
  getDepartmentsByFaculty,
  getClassesByDepartment,
  createClass,
  assignClassAdvisor,
  removeClassAdvisor,
  getAdvisorHistory,
  addStudentsToClass,
  getAvailableInstructors,
  getStudentsByFilter,
} from "../controllers/academicController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  requireRole,
  requireDeptHead,
} from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===== Faculty Routes =====
router.get("/faculties", getAllFaculties);

// ===== Department Routes =====
router.get("/departments/:facultyId", getDepartmentsByFaculty);

// ===== Class Routes =====
router.get("/classes/:departmentId", getClassesByDepartment);

// ===== Student Filter (สำหรับหน้าลงทะเบียนลายนิ้วมือ) =====
router.get("/students/filter", getStudentsByFilter);

// Create class (Dept Head, Admin, Central Registrar)
router.post(
  "/classes",
  requireRole("dept_head", "admin", "superadmin", "central_registrar"),
  createClass,
);

// ===== Advisor Management (Dept Head only) =====
// Assign advisor to class
router.post("/classes/:classId/advisor", requireDeptHead, assignClassAdvisor);

// Remove advisor from class
router.delete("/classes/:classId/advisor", requireDeptHead, removeClassAdvisor);

// Get advisor change history
router.get(
  "/classes/:classId/advisor-history",
  requireRole("dept_head", "admin", "superadmin"),
  getAdvisorHistory,
);

// ===== Student Management =====
// Add students to class
router.post(
  "/classes/:classId/students",
  requireRole(
    "dept_head",
    "admin",
    "superadmin",
    "central_registrar",
    "faculty_registrar",
  ),
  addStudentsToClass,
);

// ===== Instructor lookup =====
router.get(
  "/instructors",
  requireRole(
    "dept_head",
    "admin",
    "superadmin",
    "central_registrar",
    "faculty_registrar",
  ),
  getAvailableInstructors,
);

export default router;
