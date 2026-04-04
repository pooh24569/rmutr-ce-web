import express from "express";
import {
  startSession,
  closeSession,
  getOpenSessions,
  getSessionDetail,
  getOfferingSessions,
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
  authorizeRoles("instructor"),
  startSession,
);

router.patch(
  "/sessions/:sessionId/close",
  verifyToken,
  authorizeRoles("instructor"),
  closeSession,
);

router.get(
  "/sessions/open",
  verifyToken,
  authorizeRoles("instructor"),
  getOpenSessions,
);

router.get(
  "/sessions/:sessionId",
  verifyToken,
  authorizeRoles("instructor"),
  getSessionDetail,
);

router.get(
  "/sessions/offering/:offeringId",
  verifyToken,
  authorizeRoles("instructor"),
  getOfferingSessions,
);

router.post("/attendance/check-in", checkInByFingerprint);

router.post(
  "/attendance/manual",
  verifyToken,
  authorizeRoles("instructor"),
  manualCheckIn,
);

router.get(
  "/attendance/history/:offeringId",
  verifyToken,
  authorizeRoles("student"),
  getStudentAttendanceHistory,
);

router.get(
  "/attendance/summary/:offeringId",
  verifyToken,
  authorizeRoles("instructor"),
  getClassAttendanceSummary,
);

export default router;
