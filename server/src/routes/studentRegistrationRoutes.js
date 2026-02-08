import express from "express";
import {
  getAvailableCourses,
  getMyRegisteredCourses,
  enrollCourse,
  dropCourse,
  getAcademicRecords,
  addAcademicRecord,
} from "../controllers/studentRegistrationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===== Student Course Registration =====

// Get available courses for registration
router.get("/available", getAvailableCourses);

// Get my registered courses
router.get("/my-courses", getMyRegisteredCourses);

// Enroll in a course
router.post("/enroll", requireRole("student"), enrollCourse);

// Drop a course
router.delete("/drop/:offeringId", requireRole("student"), dropCourse);

// ===== Academic Records (8-year tracking) =====

// Get my academic records
router.get("/academic-records", getAcademicRecords);

// Get specific student's academic records (admin/dept_head)
router.get(
  "/academic-records/:studentId",
  requireRole(
    "admin",
    "superadmin",
    "dept_head",
    "faculty_registrar",
    "central_registrar",
  ),
  getAcademicRecords,
);

// Add academic record (admin/registrar)
router.post(
  "/academic-records",
  requireRole("admin", "superadmin", "central_registrar", "faculty_registrar"),
  addAcademicRecord,
);

export default router;
