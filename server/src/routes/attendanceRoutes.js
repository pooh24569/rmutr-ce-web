import express from "express";
import {
  startSession,
  closeSession,
  getOpenSessions,
  getSessionDetail,
  getClassSessions,
} from "../controllers/sessionController.js";
import {
  checkInByFingerprint,
  manualCheckIn,
  getStudentAttendanceHistory,
  getClassAttendanceSummary,
} from "../controllers/attendanceController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * ============================================================
 * 📚 Session & Attendance Routes
 * ============================================================
 * 
 * Session Routes (Teacher only):
 * - POST   /sessions/start         - เปิดเรียน
 * - PATCH  /sessions/:sessionId/close - ปิดเรียน
 * - GET    /sessions/open          - ดู Session ที่เปิดอยู่
 * - GET    /sessions/:sessionId    - ดูรายละเอียด Session
 * - GET    /sessions/class/:classId - ดูประวัติ Session ของวิชา
 * 
 * Attendance Routes:
 * - POST   /attendance/check-in    - เช็คชื่อ (Fingerprint)
 * - POST   /attendance/manual      - เช็คชื่อ Manual (Teacher)
 * - GET    /attendance/history/:classId - ดูประวัติ (Student)
 * - GET    /attendance/summary/:classId - ดูสรุป (Teacher)
 * ============================================================
 */

// ============================
// 🎓 Session Routes
// ============================

/**
 * @route   POST /api/sessions/start
 * @desc    เปิดเรียน (สร้าง Session ใหม่)
 * @access  Teacher only
 */
router.post(
  "/sessions/start",
  verifyToken,
  authorizeRoles("teacher"),
  startSession
);

/**
 * @route   PATCH /api/sessions/:sessionId/close
 * @desc    ปิดเรียน
 * @access  Teacher only (เจ้าของ Session)
 */
router.patch(
  "/sessions/:sessionId/close",
  verifyToken,
  authorizeRoles("teacher"),
  closeSession
);

/**
 * @route   GET /api/sessions/open
 * @desc    ดึง Session ที่เปิดอยู่ของอาจารย์
 * @access  Teacher only
 */
router.get(
  "/sessions/open",
  verifyToken,
  authorizeRoles("teacher"),
  getOpenSessions
);

/**
 * @route   GET /api/sessions/:sessionId
 * @desc    ดึงรายละเอียด Session พร้อม Attendance
 * @access  Teacher only
 */
router.get(
  "/sessions/:sessionId",
  verifyToken,
  authorizeRoles("teacher"),
  getSessionDetail
);

/**
 * @route   GET /api/sessions/class/:classId
 * @desc    ดึงประวัติ Session ของวิชา
 * @access  Teacher only
 */
router.get(
  "/sessions/class/:classId",
  verifyToken,
  authorizeRoles("teacher"),
  getClassSessions
);

// ============================
// 📋 Attendance Routes
// ============================

/**
 * @route   POST /api/attendance/check-in
 * @desc    เช็คชื่อด้วยลายนิ้วมือ (จากเครื่องสแกน/Mobile)
 * @access  Public (เครื่องสแกนมี API Key อีกชั้น)
 * 
 * Note: ในระบบจริงควรมี API Key หรือ Device Token
 *       สำหรับยืนยันว่าเป็นเครื่องสแกนจริง
 */
router.post(
  "/attendance/check-in",
  checkInByFingerprint
);

/**
 * @route   POST /api/attendance/manual
 * @desc    เช็คชื่อ Manual (อาจารย์เช็คให้)
 * @access  Teacher only
 */
router.post(
  "/attendance/manual",
  verifyToken,
  authorizeRoles("teacher"),
  manualCheckIn
);

/**
 * @route   GET /api/attendance/history/:classId
 * @desc    ดูประวัติเช็คชื่อของนักศึกษา
 * @access  Student only (ดูของตัวเอง)
 */
router.get(
  "/attendance/history/:classId",
  verifyToken,
  authorizeRoles("student"),
  getStudentAttendanceHistory
);

/**
 * @route   GET /api/attendance/summary/:classId
 * @desc    ดูสรุปการเข้าเรียนของวิชา
 * @access  Teacher only
 */
router.get(
  "/attendance/summary/:classId",
  verifyToken,
  authorizeRoles("teacher"),
  getClassAttendanceSummary
);

export default router;
