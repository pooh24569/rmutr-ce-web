import express from "express";
import {
  createClass,
  getMyClasses,
  getEnrolledClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getAllStudents,
  importStudentsToClass,
} from "../controllers/classController.js";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  createClass,
);

router.get(
  "/my-classes",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  getMyClasses,
);

router.put(
  "/:classId",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  updateClass,
);

router.delete(
  "/:classId",
  verifyToken,
  authorizeRoles("admin", "superadmin"),
  deleteClass,
);

router.post(
  "/:classId/students",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  addStudentToClass,
);

router.delete(
  "/:classId/students/:studentId",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  removeStudentFromClass,
);

router.get(
  "/students/all",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  getAllStudents,
);

router.post(
  "/:classId/import",
  verifyToken,
  authorizeRoles("teacher", "admin", "superadmin"),
  importStudentsToClass,
);

router.get(
  "/enrolled",
  verifyToken,
  authorizeRoles("student"),
  getEnrolledClasses,
);

router.get("/:classId", verifyToken, getClassById);

export default router;
