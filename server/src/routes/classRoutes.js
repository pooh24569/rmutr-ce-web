import express from "express";
import {
  createClass,
  getMyClasses,
  getEnrolledClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getAllStudents,
  importStudentsToClass,
} from "../controllers/classController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ======================================
// 🔐 ต้อง Login ทุก Route
// ======================================

// ======================================
// 👨‍🏫 Teacher Routes
// ======================================

// สร้าง Class ใหม่ (อาจารย์เท่านั้น)
router.post(
  "/",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  createClass
);

// ดึง Class ทั้งหมดของอาจารย์
router.get(
  "/my-classes",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  getMyClasses
);

// แก้ไข Class
router.put(
  "/:classId",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  updateClass
);

// ลบ Class
router.delete(
  "/:classId",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  deleteClass
);

// เพิ่มนักศึกษาเข้า Class
router.post(
  "/:classId/students",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  addStudentToClass
);

// ลบนักศึกษาออกจาก Class
router.delete(
  "/:classId/students/:studentId",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  removeStudentFromClass
);

// ดึงรายชื่อนักศึกษาทั้งหมด (สำหรับเพิ่มเข้า Class)
router.get(
  "/students/all",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  getAllStudents
);

// Import นักศึกษาจาก CSV (หลายคนพร้อมกัน)
router.post(
  "/:classId/import",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  importStudentsToClass
);

// ======================================
// 👨‍🎓 Student Routes
// ======================================

// ดึง Class ที่นักศึกษาลงทะเบียน
router.get(
  "/enrolled",
  verifyToken,
  authorizeRoles("student"),
  getEnrolledClasses
);

// ======================================
// 🔓 Shared Routes (ทุก Role)
// ======================================

// ดึงข้อมูล Class ตาม ID
router.get("/:classId", verifyToken, getClassById);

export default router;
