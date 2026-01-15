

import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getTeacherDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/teacher",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  getTeacherDashboard
);

router.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  getAdminDashboard
);

export default router;
