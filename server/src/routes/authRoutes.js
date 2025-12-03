import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  register,
  login,
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

// Import validation schemas
import {
  validate,
  registerSchema,
  loginSchema,
  requestResetSchema,
  confirmResetSchema,
  sendOtpSchema,
  verifyEmailSchema,
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "../utils/validation.js";

const authRouter = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Registration & Login
authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", logout);

// Password Reset (Link Method)
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

// Password Reset (OTP Method)
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

// Email Verification
authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail
);

// ============================================
// PROTECTED ROUTES
// ============================================

// Email Verification OTP (requires authentication)
authRouter.post(
  "/send-verify-otp",
  verifyToken,
  validate(sendOtpSchema),
  sendVerifyOtp
);

// Check authentication status
authRouter.post("/is-authenticated", verifyToken, isAuthenticated);
authRouter.get("/is-authenticated", verifyToken, isAuthenticated);

export default authRouter;