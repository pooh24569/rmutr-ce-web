import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  register,
  login,
  parentLogin,
  logout,
  requestResetPassword,
  confirmResetPassword,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOTP,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";

import {
  validate,
  registerSchema,
  loginSchema,
  parentLoginSchema,
  requestResetSchema,
  confirmResetSchema,
  sendOtpSchema,
  verifyEmailSchema,
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "../utils/validation.js";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/parent-login", validate(parentLoginSchema), parentLogin);
authRouter.post("/logout", logout);

authRouter.post(
  "/request-reset",
  validate(requestResetSchema),
  requestResetPassword
);
authRouter.post(
  "/confirm-reset",
  validate(confirmResetSchema),
  confirmResetPassword
);

authRouter.post("/send-reset-otp", validate(sendResetOtpSchema), sendResetOTP);
authRouter.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  verifyResetOtp
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);

authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail
);

authRouter.post(
  "/send-verify-otp",
  verifyToken,
  validate(sendOtpSchema),
  sendVerifyOtp
);

authRouter.post("/is-authenticated", verifyToken, isAuthenticated);
authRouter.get("/is-authenticated", verifyToken, isAuthenticated);

export default authRouter;