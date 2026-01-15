import StudentProfile from "../models/studentProfileModel.js";
import User from "../models/userModel.js";
import { logger } from "../utils/logger.js";

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

export const updateUserProfile = async (userId, data) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "profileImage",
    ];

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

export const updateStudentProfile = async (userId, data) => {
  try {

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

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) {
          studentProfile[key] = data[key];
        }
      });
      await studentProfile.save();
      logger.info("Student profile updated", { userId });
    } else {

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
