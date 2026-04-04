import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseOfferings,
  getCourseOfferingById,
  createCourseOffering,
  updateCourseOffering,
  toggleRegistration,
  getInstructors,
  enrollStudentsToOffering,
  removeStudentFromOffering,
  updateOfferingSchedule,
  getMyTeachingOfferings,
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

// ===== Instructor Routes =====

// Get my teaching offerings (for instructor dashboard)
router.get("/offerings/my-teaching", requireRole("instructor", ...REGISTRAR_ROLES), getMyTeachingOfferings);

// Get all instructors (for dropdown)
router.get("/instructors", requireRole(...REGISTRAR_ROLES), getInstructors);

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

// Get single offering with full details
router.get("/offerings/:id", requireRole(...REGISTRAR_ROLES), getCourseOfferingById);

// Create offering (Central Registrar + Admin)
router.post(
  "/offerings",
  requireRole("central_registrar", "admin", "superadmin"),
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

// Update offering schedule (Faculty Registrar + Admin)
router.put(
  "/offerings/:id/schedule",
  requireRole(...REGISTRAR_ROLES),
  updateOfferingSchedule,
);

// Enroll students to offering (Faculty Registrar + Admin)
router.post(
  "/offerings/:id/enroll",
  requireRole(...REGISTRAR_ROLES),
  enrollStudentsToOffering,
);

// Remove student from offering
router.delete(
  "/offerings/:id/students/:studentId",
  requireRole(...REGISTRAR_ROLES),
  removeStudentFromOffering,
);

export default router;
