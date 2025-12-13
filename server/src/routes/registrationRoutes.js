/**
 * Registration Routes
 * API สำหรับข้อมูลทะเบียน
 */

import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getMyEnrolledCourses,
  getMyTeachingCourses,
  listAllCourses,
  getCourse,
} from "../controllers/registrationController.js";

const registrationRouter = express.Router();

// ต้อง Login ก่อน
registrationRouter.use(verifyToken);

/**
 * GET /api/registration/enrolled
 * ดึงรายวิชาที่นักศึกษาลงทะเบียน
 */
registrationRouter.get(
  "/enrolled",
  authorizeRoles("student"),
  getMyEnrolledCourses
);

/**
 * GET /api/registration/teaching
 * ดึงรายวิชาที่อาจารย์สอน
 */
registrationRouter.get(
  "/teaching",
  authorizeRoles("teacher"),
  getMyTeachingCourses
);

/**
 * GET /api/registration/courses
 * ดึงรายวิชาทั้งหมด (Student/Admin/Teacher)
 */
registrationRouter.get(
  "/courses",
  authorizeRoles("student", "teacher", "admin", "superadmin"),
  listAllCourses
);

/**
 * GET /api/registration/courses/:courseCode
 * ดึงรายวิชาตาม courseCode
 */
registrationRouter.get("/courses/:courseCode", getCourse);

export default registrationRouter;
