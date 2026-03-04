/**
 * profileService.js
 *
 * Handles user profile retrieval and updates.
 * Parent account creation is delegated to parentAccountService.
 */

import StudentProfile from "../models/studentProfileModel.js";
import User from "../models/userModel.js";
import { logger } from "../utils/logger.js";
import { createParentAccountsForStudent } from "./parentAccountService.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NESTED_PROFILE_FIELDS = [
  "previousEducation",
  "address",
  "father",
  "mother",
  "guardian",
  "emergencyContact",
  "education",
];


const computeCardDates = (referenceDate) => {
  const cardIssueDate = new Date(referenceDate);
  const cardExpiryDate = new Date(referenceDate);
  cardExpiryDate.setFullYear(cardExpiryDate.getFullYear() + 4);
  cardExpiryDate.setMonth(cardExpiryDate.getMonth() + 6);
  return { cardIssueDate, cardExpiryDate };
};

// ─── Service functions ────────────────────────────────────────────────────────

export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const profileData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      isAccountVerified: user.isAccountVerified,
    };

    if (user.role === "student") {
      profileData.studentProfile = (await StudentProfile.findOne({ userId })) || null;
    }

    return profileData;
  } catch (error) {
    logger.error("Error getting user profile", { userId, error: error.message });
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    for (const field of ["firstName", "lastName", "phoneNumber", "profileImage"]) {
      if (data[field] !== undefined) user[field] = data[field];
    }

    await user.save();
    logger.info("User profile updated", { userId });

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
    };
  } catch (error) {
    logger.error("Error updating user profile", { userId, error: error.message });
    throw error;
  }
};

export const updateStudentProfile = async (userId, data) => {
  try {
    // Prevent frontend from overriding auto-set card dates
    delete data.cardIssueDate;
    delete data.cardExpiryDate;

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== "student") {
      const error = new Error("Only students can have student profiles");
      error.statusCode = 403;
      throw error;
    }

    let studentProfile = await StudentProfile.findOne({ userId });

    if (studentProfile) {
      // Merge fields
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        if (NESTED_PROFILE_FIELDS.includes(key) && typeof value === "object" && value !== null) {
          const existing = studentProfile[key]?.toObject?.() ?? studentProfile[key] ?? {};
          studentProfile[key] = { ...existing, ...value };
          studentProfile.markModified(key);
        } else {
          studentProfile[key] = value;
        }
      }

      // Auto-fill card dates if missing
      if (!studentProfile.cardIssueDate || !studentProfile.cardExpiryDate) {
        const { cardIssueDate, cardExpiryDate } = computeCardDates(user.createdAt || new Date());
        studentProfile.cardIssueDate = cardIssueDate;
        studentProfile.cardExpiryDate = cardExpiryDate;
        logger.info("Auto-set card dates for existing profile", { userId });
      }

      await studentProfile.save();
      logger.info("Student profile updated", { userId });
    } else {
      const { cardIssueDate, cardExpiryDate } = computeCardDates(user.createdAt || new Date());
      studentProfile = await StudentProfile.create({ userId, ...data, cardIssueDate, cardExpiryDate });
      logger.info("Student profile created", { userId });
    }

    return studentProfile;
  } catch (error) {
    // MongoDB duplicate key → แปลง error ให้อ่านเข้าใจได้
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "ข้อมูล";
      const friendlyField = field === "studentId" ? "รหัสนักศึกษา" : field;
      const friendly = new Error(
        `${friendlyField} นี้ถูกใช้งานโดยบัญชีอื่นในระบบแล้ว กรุณาตรวจสอบข้อมูล`
      );
      friendly.statusCode = 409;
      logger.error("Error updating student profile", { userId, error: error.message });
      throw friendly;
    }
    logger.error("Error updating student profile", { userId, error: error.message });
    throw error;
  }
};

export const uploadProfileImage = async (userId, imageData) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (!imageData.startsWith("data:image/")) {
      const error = new Error("Invalid image format");
      error.statusCode = 400;
      throw error;
    }

    user.profileImage = imageData;
    await user.save();

    logger.info("Profile image uploaded", { userId });
    return { profileImage: user.profileImage };
  } catch (error) {
    logger.error("Error uploading profile image", { userId, error: error.message });
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateStudentProfile,
  createParentAccountsForStudent,
  uploadProfileImage,
};
