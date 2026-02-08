import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseOfferings,
  createCourseOffering,
  updateCourseOffering,
  toggleRegistration,
} from "../controllers/courseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Registrar roles
const REGISTRAR_ROLES = [
  "central_registrar",
  "faculty_registrar",
  "admin",
  "superadmin",
];

// ===== Course Catalog Routes =====

// Get all courses (everyone can view)
router.get("/", getAllCourses);

// Get single course
router.get("/:id", getCourseById);

// Create course (Registrar only)
router.post("/", requireRole(...REGISTRAR_ROLES), createCourse);

// Update course (Registrar only)
router.put("/:id", requireRole(...REGISTRAR_ROLES), updateCourse);

// Delete/Deactivate course (Registrar only)
router.delete("/:id", requireRole(...REGISTRAR_ROLES), deleteCourse);

// ===== Course Offering (Section) Routes =====

// Get offerings
router.get("/offerings/list", getCourseOfferings);

// Create offering
router.post(
  "/offerings",
  requireRole(...REGISTRAR_ROLES),
  createCourseOffering,
);

// Update offering
router.put(
  "/offerings/:id",
  requireRole(...REGISTRAR_ROLES),
  updateCourseOffering,
);

// Toggle registration
router.patch(
  "/offerings/:id/toggle-registration",
  requireRole(...REGISTRAR_ROLES),
  toggleRegistration,
);

export default router;
