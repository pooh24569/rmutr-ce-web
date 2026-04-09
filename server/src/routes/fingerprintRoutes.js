/**
 * ===================================================================
 * 🔐 Fingerprint Routes
 * ===================================================================
 *
 * REST API Endpoints สำหรับระบบลายนิ้วมือ
 *
 * Routes:
 * POST   /api/fingerprint/enroll              → ลงทะเบียนลายนิ้วมือ (instructor)
 * POST   /api/fingerprint/identify            → ระบุตัวตน + เช็คชื่อ (จาก scanner)
 * POST   /api/fingerprint/verify              → เทียบ 1:1 (instructor)
 * GET    /api/fingerprint/status/:studentId   → ตรวจสอบสถานะลงทะเบียน (instructor)
 * POST   /api/fingerprint/status/bulk         → ตรวจสอบสถานะรายกลุ่ม (instructor)
 * DELETE /api/fingerprint/:studentId          → ลบลายนิ้วมือ (instructor/admin)
 *
 * Security:
 * - enroll, verify, status, delete → ต้อง login + role instructor/admin
 * - identify → ใช้ device token แทน (scanner ส่งมาโดยตรง)
 *
 * ===================================================================
 */

import express from "express";
import {
  enrollFingerprint,
  identifyAndCheckIn,
  verifyStudent,
  getEnrollmentStatus,
  getBulkEnrollmentStatus,
  deleteFingerprint,
} from "../controllers/fingerprintController.js";
import authenticate, { authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ===== Enrollment =====
// POST /api/fingerprint/enroll
// Body: { studentId, imageBase64, fingerIndex?, pdpaConsent }
// Auth: instructor only (อาจารย์ลงทะเบียนให้นักศึกษา)
router.post(
  "/enroll",
  authenticate,
  authorizeRoles("instructor", "admin", "superadmin"),
  enrollFingerprint,
);

// ===== Identify & Check-in =====
// POST /api/fingerprint/identify
// Body: { sessionId, imageBase64 }
// Auth: ใช้ checkInLimiter แทน (scanner device ส่งมาโดยตรง)
// Note: ไม่ใช้ verifyToken เพราะ scanner ไม่ได้ login
//       แต่ใช้ rate limiter + sessionId เป็น authorization
router.post("/identify", identifyAndCheckIn);

// ===== Verify 1:1 =====
// POST /api/fingerprint/verify
// Body: { studentId, imageBase64 }
// Auth: instructor only
router.post(
  "/verify",
  authenticate,
  authorizeRoles("instructor", "admin", "superadmin"),
  verifyStudent,
);

// ===== Enrollment Status (single student) =====
// GET /api/fingerprint/status/:studentId
// Auth: instructor/admin
router.get(
  "/status/:studentId",
  authenticate,
  authorizeRoles("instructor", "admin", "superadmin"),
  getEnrollmentStatus,
);

// ===== Enrollment Status (bulk — สำหรับดูทั้งห้อง) =====
// POST /api/fingerprint/status/bulk
// Body: { studentIds: ["id1", "id2", ...] }
// Auth: instructor/admin
router.post(
  "/status/bulk",
  authenticate,
  authorizeRoles("instructor", "admin", "superadmin"),
  getBulkEnrollmentStatus,
);

// ===== Delete Fingerprint (PDPA Right to Erasure) =====
// DELETE /api/fingerprint/:studentId?fingerIndex=RIGHT_INDEX
// Auth: instructor/admin
router.delete(
  "/:studentId",
  authenticate,
  authorizeRoles("instructor", "admin", "superadmin"),
  deleteFingerprint,
);

export default router;
