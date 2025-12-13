import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../utils/validation.js";
import {
  updateProfileSchema,
  updateStudentProfileSchema,
} from "../utils/validation.js";
import {
  getProfile,
  updateProfile,
  updateStudentProfile,
  uploadProfileImage,
} from "../controllers/profileController.js";

const profileRouter = express.Router();

// All routes require authentication
profileRouter.use(verifyToken);

/**
 * GET /api/profile
 * Get current user's profile
 */
profileRouter.get("/", getProfile);

/**
 * PUT /api/profile
 * Update basic user profile (firstName, lastName, phoneNumber, profileImage)
 */
profileRouter.put("/", validate(updateProfileSchema), updateProfile);

/**
 * PUT /api/profile/student
 * Update student-specific profile (only for students)
 */
profileRouter.put(
  "/student",
  authorizeRoles("student"),
  validate(updateStudentProfileSchema),
  updateStudentProfile
);

/**
 * POST /api/profile/image
 * Upload profile image (Base64)
 */
profileRouter.post("/image", uploadProfileImage);

export default profileRouter;
