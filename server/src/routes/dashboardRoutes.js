/**
 * Dashboard Routes
 * API routes for dashboard statistics
 */

import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getTeacherDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Teacher Dashboard - ต้องเป็น teacher หรือ admin
router.get(
  "/teacher",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  getTeacherDashboard
);

// Admin Dashboard - ต้องเป็น admin
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  getAdminDashboard
);

export default router;
