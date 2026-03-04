import express from "express";
import {
  getStudentInfo,
  getStudentAttendance,
  getStudentSchedule,
} from "../controllers/parentAuthController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Parent login is now handled by /auth/login (standard auth)
// All routes require parent role

router.get(
  "/student-info",
  authenticate,
  authorizeRoles("parent"),
  getStudentInfo
);

router.get(
  "/attendance",
  authenticate,
  authorizeRoles("parent"),
  getStudentAttendance
);

router.get(
  "/schedule",
  authenticate,
  authorizeRoles("parent"),
  getStudentSchedule
);

export default router;
