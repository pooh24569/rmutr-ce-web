import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadHomework } from "../middlewares/uploadMiddleware.js";
import {
  createHomework,
  getHomeworkByOffering,
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
  authorizeRoles("instructor", "admin"),
  createHomework,
);

router.get(
  "/:homeworkId/submissions",
  verifyToken,
  authorizeRoles("instructor", "admin"),
  getSubmissions,
);

router.put(
  "/submissions/:submissionId/grade",
  verifyToken,
  authorizeRoles("instructor", "admin"),
  gradeSubmission,
);

router.delete(
  "/:homeworkId",
  verifyToken,
  authorizeRoles("instructor", "admin"),
  deleteHomework,
);

router.get("/my", verifyToken, authorizeRoles("student"), getMyHomework);

router.post(
  "/:homeworkId/submit",
  verifyToken,
  authorizeRoles("student"),
  uploadHomework.array("attachments", 10),
  submitHomework,
);

router.get("/offering/:offeringId", verifyToken, getHomeworkByOffering);

router.get("/:homeworkId", verifyToken, getHomeworkById);

export default router;
