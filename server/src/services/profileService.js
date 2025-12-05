import StudentProfile from "../models/studentProfileModel.js";
import User from "../models/userModel.js";
import { logger } from "../utils/logger.js";

/**
 * Get complete user profile (User + StudentProfile if student)
 * @param {string} userId - User ID
 * @returns {Object} Combined profile data
 */
export const getUserProfile = async (userId) => {
  try {
    // Get user data
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

    // If student, get student profile
    if (user.role === "student") {
      const studentProfile = await StudentProfile.findOne({ userId });
      profileData.studentProfile = studentProfile || null;
    }

    return profileData;
  } catch (error) {
    logger.error("Error getting user profile", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Update basic user profile (firstName, lastName, phoneNumber, profileImage)
 * @param {string} userId - User ID
 * @param {Object} data - Profile data to update
 * @returns {Object} Updated user data
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Update allowed fields
    const allowedFields = ["firstName", "lastName", "phoneNumber", "profileImage"];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        user[field] = data[field];
      }
    });

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
    logger.error("Error updating user profile", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Update or create student profile
 * @param {string} userId - User ID
 * @param {Object} data - Student profile data
 * @returns {Object} Updated/created student profile
 */
export const updateStudentProfile = async (userId, data) => {
  try {
    // Verify user exists and is a student
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

    // Find existing profile or create new one
    let studentProfile = await StudentProfile.findOne({ userId });

    if (studentProfile) {
      // Update existing profile
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) {
          studentProfile[key] = data[key];
        }
      });
      await studentProfile.save();
      logger.info("Student profile updated", { userId });
    } else {
      // Create new profile
      studentProfile = await StudentProfile.create({
        userId,
        ...data,
      });
      logger.info("Student profile created", { userId });
    }

    return studentProfile;
  } catch (error) {
    logger.error("Error updating student profile", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Upload profile image (Base64)
 * @param {string} userId - User ID
 * @param {string} imageData - Base64 encoded image
 * @returns {Object} Updated user with new profile image
 */
export const uploadProfileImage = async (userId, imageData) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate base64 image format
    if (!imageData.startsWith("data:image/")) {
      const error = new Error("Invalid image format");
      error.statusCode = 400;
      throw error;
    }

    user.profileImage = imageData;
    await user.save();

    logger.info("Profile image uploaded", { userId });

    return {
      profileImage: user.profileImage,
    };
  } catch (error) {
    logger.error("Error uploading profile image", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateStudentProfile,
  uploadProfileImage,
};
