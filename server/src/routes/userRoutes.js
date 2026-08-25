import express from "express";
import verifyToken, { authorizeRoles } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.get(
  "/superadmin",
  verifyToken,
  authorizeRoles("superadmin"),
  (_req, res) => res.json({ message: "Superadmin route accessed" }),
);
userRouter.get(
  "/admin",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  (_req, res) => res.json({ message: "Admin route accessed" }),
);
userRouter.get(
  "/teacher",
  verifyToken,
  authorizeRoles("superadmin", "admin", "instructor"),
  (_req, res) => res.json({ message: "Teacher route accessed" }),
);
userRouter.get(
  "/student",
  verifyToken,
  authorizeRoles("superadmin", "admin", "instructor", "student"),
  (_req, res) => res.json({ message: "Student route accessed" }),
);
userRouter.get(
  "/parent",
  verifyToken,
  authorizeRoles("superadmin", "admin", "parent"),
  (_req, res) => res.json({ message: "Parent route accessed" }),
);

export default userRouter;
