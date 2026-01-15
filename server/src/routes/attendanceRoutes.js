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
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/sessions/start",
  verifyToken,
  authorizeRoles("teacher"),
  startSession
);

router.patch(
  "/sessions/:sessionId/close",
  verifyToken,
  authorizeRoles("teacher"),
  closeSession
);

router.get(
  "/sessions/open",
  verifyToken,
  authorizeRoles("teacher"),
  getOpenSessions
);

router.get(
  "/sessions/:sessionId",
  verifyToken,
  authorizeRoles("teacher"),
  getSessionDetail
);

router.get(
  "/sessions/class/:classId",
  verifyToken,
  authorizeRoles("teacher"),
  getClassSessions
);

router.post("/attendance/check-in", checkInByFingerprint);

router.post(
  "/attendance/manual",
  verifyToken,
  authorizeRoles("teacher"),
  manualCheckIn
);

router.get(
  "/attendance/history/:classId",
  verifyToken,
  authorizeRoles("student"),
  getStudentAttendanceHistory
);

router.get(
  "/attendance/summary/:classId",
  verifyToken,
  authorizeRoles("teacher"),
  getClassAttendanceSummary
);

export default router;
