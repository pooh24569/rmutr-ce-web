

import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadHomework } from "../middlewares/uploadMiddleware.js";
import {
  createHomework,
  getHomeworkByClass,
  getMyHomework,
  getHomeworkById,
  submitHomework,
  getSubmissions,
  gradeSubmission,
  deleteHomework,
} from "../controllers/homeworkController.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  createHomework
);

router.get(
  "/:homeworkId/submissions",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  getSubmissions
);

router.put(
  "/submissions/:submissionId/grade",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  gradeSubmission
);

router.delete(
  "/:homeworkId",
  verifyToken,
  authorizeRoles("teacher", "admin"),
  deleteHomework
);

router.get("/my", verifyToken, authorizeRoles("student"), getMyHomework);

router.post(
  "/:homeworkId/submit",
  verifyToken,
  authorizeRoles("student"),
  uploadHomework.array("attachments", 10),
  submitHomework
);

router.get("/class/:classId", verifyToken, getHomeworkByClass);

router.get("/:homeworkId", verifyToken, getHomeworkById);

export default router;
