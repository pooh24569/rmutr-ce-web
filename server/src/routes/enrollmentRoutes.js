import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateObjectIdParams } from "../utils/validateId.js";
import {
  getAvailableClasses,
  getMyEnrollments,
  enrollClass,
  dropClass,
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("student"));

router.get("/available", getAvailableClasses);

router.get("/my", getMyEnrollments);

router.post("/:classId", validateObjectIdParams("classId"), enrollClass);

router.delete("/:classId", validateObjectIdParams("classId"), dropClass);

export default router;
