// backend/src/services/emailService.js
import { sendOtpEmail as sendOtpMail } from "../config/nodemailer.js";
import { logger } from "../utils/logger.js";

export const sendVerificationOtp = async (user, otp, minutes = 10) => {
  try {
    await sendOtpMail({
      to: user.email,
      email: user.email,
      otp,
      purpose: "Account Verification",
      minutes,
    });

    logger.info("Verification OTP sent", {
      userId: user._id,
      email: user.email,
    });
    return { success: true };
  } catch (error) {
    logger.error("Failed to send verification OTP", {
      userId: user._id,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetOtp = async (user, otp, minutes = 10) => {
    try {
        await sendOtpMail({
            to: user.email,
            email: user.email,
            otp,
            purpose: "Password Reset",
            minutes,
        });

        logger.info("Password reset OTP sent", {
            userId: user._id,
            email: user.email,
        });
        return { success: true };
    } catch (error) {
        logger.error("Failed to send password reset OTP", {
            userId: user._id,
            error: error.message,
        });
        return { success: false, error: error.message };
    }
};