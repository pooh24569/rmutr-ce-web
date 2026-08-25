import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import { canDeleteUser, canAssignRole } from "../middlewares/policies.js";
import * as UserCtrl from "../controllers/userController.js";
import {
  validate,
  createUserSchema,
  updateUserSchema,
  adminResetPasswordSchema,
} from "../utils/validation.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  UserCtrl.list,
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  validate(createUserSchema),
  canAssignRole,
  UserCtrl.create,
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  validate(updateUserSchema),
  canAssignRole,
  UserCtrl.update,
);

router.patch(
  "/:id/reset-password",
  verifyToken,
  authorizeRoles("superadmin"),
  validate(adminResetPasswordSchema),
  UserCtrl.resetPassword,
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  canDeleteUser,
  UserCtrl.remove,
);

export default router;
