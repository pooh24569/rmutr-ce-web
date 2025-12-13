import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateObjectIdParams } from "../utils/validateId.js";
import {
  getAvailableClasses,
  getMyEnrollments,
  enrollClass,
  dropClass,
} from "../controllers/enrollmentController.js";

const router = express.Router();

// ทุก route ต้อง login และเป็น student
router.use(authenticate);
router.use(authorizeRoles("student"));

// GET /api/enrollments/available - ดึงวิชาที่เปิดให้ลงทะเบียน
router.get("/available", getAvailableClasses);

// GET /api/enrollments/my - ดึงวิชาที่ลงทะเบียนแล้ว
router.get("/my", getMyEnrollments);

// ✅ SECURITY FIX: Add ObjectId validation for classId
// POST /api/enrollments/:classId - ลงทะเบียนวิชา
router.post("/:classId", validateObjectIdParams("classId"), enrollClass);

// DELETE /api/enrollments/:classId - ยกเลิกลงทะเบียน
router.delete("/:classId", validateObjectIdParams("classId"), dropClass);

export default router;
