/**
 * Homework Routes
 * API routes for homework management
 */

import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadHomework } from "../middlewares/uploadMiddleware.js";
import {
  createHomework,
  getHomeworkByClass,
  getMyHomework,
  getHomeworkById,
  submitHomework,
  getSubmissions,
  gradeSubmission,
  deleteHomework,
} from "../controllers/homeworkController.js";

const router = express.Router();

// ==========================================
// Teacher Routes
// ==========================================

// สร้างการบ้าน
router.post(
  "/",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  createHomework
);

// ดู submissions ของการบ้าน
router.get(
  "/:homeworkId/submissions",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  getSubmissions
);

// ให้คะแนน
router.put(
  "/submissions/:submissionId/grade",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  gradeSubmission
);

// ลบการบ้าน
router.delete(
  "/:homeworkId",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  deleteHomework
);

// ==========================================
// Student Routes
// ==========================================

// ดูการบ้านทั้งหมดของตัวเอง
router.get("/my", verifyToken, authorizeRoles("student"), getMyHomework);

// ส่งการบ้าน (รองรับไฟล์แนบ)
router.post(
  "/:homeworkId/submit",
  verifyToken,
  authorizeRoles("student"),
  uploadHomework.array("attachments", 10),
  submitHomework
);

// ==========================================
// Shared Routes
// ==========================================

// ดูการบ้านของวิชา
router.get("/class/:classId", verifyToken, getHomeworkByClass);

// ดูรายละเอียดการบ้าน
router.get("/:homeworkId", verifyToken, getHomeworkById);

export default router;
