import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";
import { canDeleteUser, canAssignRole } from "../middlewares/policies.js";
import * as UserCtrl from "../controllers/userController.js";
import { validate, createUserSchema } from "../utils/validation.js";

const router = express.Router();

// GET /api/user-admin
router.get(
  "/",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  UserCtrl.list
);

// POST /api/user-admin
router.post(
  "/",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  validate(createUserSchema), // ✅ ตรวจ username/email/password/role ด้วย Joi
  canAssignRole,
  UserCtrl.create
);

// DELETE /api/user-admin/:id
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  canDeleteUser,
  UserCtrl.remove
);

export default router;
