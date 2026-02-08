import express from "express";
import {
  parentLogin,
  getStudentInfo,
  getStudentAttendance,
  getStudentSchedule,
} from "../controllers/parentAuthController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", parentLogin);

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
