import express from "express";
import {
  createClass,
  getMyClasses,
  getAllClasses,
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

// Registrar + Admin roles
const MANAGE_ROLES = ["central_registrar", "admin", "superadmin"];

router.post(
  "/",
  verifyToken,
  authorizeRoles(...MANAGE_ROLES),
  createClass,
);

// Get all classes (for registrar management view)
router.get(
  "/all",
  verifyToken,
  authorizeRoles(...MANAGE_ROLES),
  getAllClasses,
);

router.get(
  "/my-classes",
  verifyToken,
  authorizeRoles("instructor", ...MANAGE_ROLES),
  getMyClasses,
);

router.put(
  "/:classId",
  verifyToken,
  authorizeRoles(...MANAGE_ROLES),
  updateClass,
);

router.delete(
  "/:classId",
  verifyToken,
  authorizeRoles(...MANAGE_ROLES),
  deleteClass,
);

router.post(
  "/:classId/students",
  verifyToken,
  authorizeRoles("instructor", ...MANAGE_ROLES),
  addStudentToClass,
);

router.delete(
  "/:classId/students/:studentId",
  verifyToken,
  authorizeRoles("instructor", ...MANAGE_ROLES),
  removeStudentFromClass,
);

router.get(
  "/students/all",
  verifyToken,
  authorizeRoles("instructor", ...MANAGE_ROLES),
  getAllStudents,
);

router.post(
  "/:classId/import",
  verifyToken,
  authorizeRoles("instructor", ...MANAGE_ROLES),
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
