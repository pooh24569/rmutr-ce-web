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

profileRouter.use(verifyToken);

profileRouter.get("/", getProfile);

profileRouter.put("/", validate(updateProfileSchema), updateProfile);

profileRouter.put(
  "/student",
  authorizeRoles("student"),
  validate(updateStudentProfileSchema),
  updateStudentProfile
);

profileRouter.post("/image", uploadProfileImage);

export default profileRouter;
