import * as authService from "../services/authService.js";
import { logger } from "../utils/logger.js";

export async function register(req, res) {
  try {
    const { username, password, role, email, firstName, lastName } = req.body;

    const allowedRoles = [
      "student",
      "instructor",
      "parent",
      "admin",
      "superadmin",
    ];
    const finalRole = allowedRoles.includes(role) ? role : "student";

    const result = await authService.registerUser({
      username,
      email,
      password,
      role: finalRole,
      firstName,
      lastName,
    });

    return res.status(201).json({
      success: true,
      message: result.emailSent
        ? "Registered successfully! Please check your email for verification code."
        : "Registered successfully, but failed to send verification email. Please request a new OTP.",
      userId: result.user.id,
      email: result.user.email,
      emailSent: result.emailSent,
    });
  } catch (error) {
    logger.error("Registration error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Registration failed. Please try again.",
    });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const result = await authService.loginUser({ username, password });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Logged in successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    logger.error("Login error", {
      error: error.message,
      stack: error.stack,
    });

    if (error.code === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({
        success: false,
        message: error.message,
        requiresVerification: true,
        userId: error.userId,
        email: error.email,
      });
    }

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Login failed. Please try again.",
    });
  }
}

export async function logout(_req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}

export async function sendResetOTP(req, res) {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    await authService.sendResetOtp(email);

    return res.json({
      success: true,
      message: "รหัส OTP ถูกส่งไปที่อีเมลของคุณแล้ว",
    });
  } catch (error) {
    logger.error("Send reset OTP error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง",
    });
  }
}

export async function verifyResetOtp(req, res) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const otp = String(req.body.otp || "").trim();

    await authService.verifyResetOtpCode(email, otp);

    return res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    logger.error("Verify reset OTP error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    await authService.resetUserPassword(email, otp, newPassword);

    return res.json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    logger.error("Reset password error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Password reset failed. Please try again.",
    });
  }
}

export async function sendVerifyOtp(req, res) {
  try {
    const { userId } = req.body;

    await authService.sendVerificationOtpCode(userId);

    return res.json({
      success: true,
      message: "Verification OTP sent to your email",
    });
  } catch (error) {
    logger.error("Send verify OTP error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to send OTP. Please try again.",
    });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { userId, otp } = req.body;

    await authService.verifyUserEmail(userId, otp);

    return res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    logger.error("Verify email error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Email verification failed. Please try again.",
    });
  }
}

export const isAuthenticated = (req, res) => {
  try {
    return res.json({
      success: true,
      message: "User is authenticated",
      user: {
        id: req.user.id,
        role: req.user.role,
      },
    });
  } catch (error) {
    logger.error("Authentication check error", { error: error.message });
    return res.status(401).json({
      success: false,
      message: "Authentication check failed",
    });
  }
};

export async function requestResetPassword(req, res) {
  try {
    const { email = "" } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    return res.json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    logger.error("Request reset password error", {
      error: error.message,
      stack: error.stack,
    });
    return res.json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  }
}

export async function confirmResetPassword(req, res) {
  try {
    return res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    logger.error("Confirm reset password error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Password reset failed. Please try again.",
    });
  }
}

export async function parentLogin(req, res) {
  try {
    const { firstName, lastName, studentId } = req.body;

    const result = await authService.loginParent({ firstName, lastName, studentId });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    logger.error("Parent login error", {
      error: error.message,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่",
    });
  }
}
