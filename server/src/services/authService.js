import userModel from "../models/userModel.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/password.js";
import { generateOtp, hashOtp, verifyOtp, isOtpExpired } from "./otpService.js";
import { sendVerificationOtp, sendPasswordResetOtp } from "./emailService.js";
import { logger } from "../utils/logger.js";

export const registerUser = async ({ username, email, password, role, firstName, lastName }) => {
  // Check if user exists
  const exists = await userModel.findOne({
    $or: [{ username }, { email: email.toLowerCase().trim() }],
  });

  if (exists) {
    const error = new Error("Username or email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const user = await userModel.create({
    username,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
    firstName: firstName?.trim() || "",
    lastName: lastName?.trim() || "",
  });

  // Generate and send OTP
  const otp = generateOtp();
  user.verifyOtp = otp;
  user.verifyOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const emailResult = await sendVerificationOtp(user, otp, 10);

  logger.info("User registered", {
    userId: user._id,
    username: user.username,
  });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    emailSent: emailResult.success,
  };
};

export const loginUser = async ({ username, password }) => {
  // Find user
  const user = await userModel.findOne({ username }).select("+password");

  if (!user) {
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    logger.warn("Invalid password attempt", { userId: user._id });
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  // Check email verification
  const requireEmailVerification =
    process.env.REQUIRE_EMAIL_VERIFICATION === "true";

  if (requireEmailVerification && !user.isAccountVerified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    error.code = "EMAIL_NOT_VERIFIED";
    error.userId = user._id;
    error.email = user.email;
    throw error;
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  logger.info("User logged in", {
    userId: user._id,
    username: user.username,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
    },
  };
};

export const sendResetOtp = async (email) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    const error = new Error("Email not found");
    error.statusCode = 404;
    throw error;
  }

  // Generate OTP
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  // Save hashed OTP
  user.resetOtpHash = otpHash;
  user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // Send email
  const emailResult = await sendPasswordResetOtp(user, otp, 15);

  if (!emailResult.success) {
    const error = new Error("Failed to send OTP");
    error.statusCode = 500;
    throw error;
  }

  logger.info("Reset OTP sent", { userId: user._id });

  return { success: true };
};

export const verifyResetOtpCode = async (email, otp) => {
  const user = await userModel.findOne({ email });

  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    const error = new Error("Invalid OTP request");
    error.statusCode = 400;
    throw error;
  }

  // Check expiry
  if (isOtpExpired(user.resetOtpExpires)) {
    logger.warn("Expired OTP attempt", { userId: user._id });
    const error = new Error("OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  // Verify OTP
  const isValid = verifyOtp(otp, user.resetOtpHash);

  if (!isValid) {
    logger.warn("Invalid OTP attempt", { userId: user._id });
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  logger.info("Reset OTP verified", { userId: user._id });

  return { success: true };
};

export const resetUserPassword = async (email, otp, newPassword) => {
  const user = await userModel.findOne({ email });

  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    const error = new Error("Invalid request");
    error.statusCode = 400;
    throw error;
  }

  // Check expiry
  if (isOtpExpired(user.resetOtpExpires)) {
    const error = new Error("OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  // Verify OTP
  const isValid = verifyOtp(otp, user.resetOtpHash);

  if (!isValid) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  // Update password
  user.password = await hashPassword(newPassword);
  user.resetOtpHash = "";
  user.resetOtpExpires = 0;
  await user.save();

  logger.info("Password reset successfully", { userId: user._id });

  return { success: true };
};

export const sendVerificationOtpCode = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.isAccountVerified) {
    const error = new Error("Account is already verified");
    error.statusCode = 400;
    throw error;
  }

  // Generate OTP
  const otp = generateOtp();
  user.verifyOtp = otp;
  user.verifyOtpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  // Send email
  const emailResult = await sendVerificationOtp(user, otp, 10);

  if (!emailResult.success) {
    const error = new Error("Failed to send OTP");
    error.statusCode = 500;
    throw error;
  }

  return { success: true };
};

export const verifyUserEmail = async (userId, otp) => {
  const user = await userModel.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.isAccountVerified) {
    const error = new Error("Account is already verified");
    error.statusCode = 400;
    throw error;
  }

  // Check OTP
  if (!user.verifyOtp || user.verifyOtp !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  // Check expiry
  if (user.verifyOtpExpiry < Date.now()) {
    const error = new Error("OTP has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  // Verify account
  user.isAccountVerified = true;
  user.verifyOtp = "";
  user.verifyOtpExpiry = 0;
  await user.save();

  logger.info("Email verified", { userId: user._id });

  return { success: true };
};
