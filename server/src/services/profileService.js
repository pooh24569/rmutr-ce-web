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
    // ========== DEBUG LOGGING ==========
    console.log("========================================");
    console.log("📥 RECEIVED DATA FROM FRONTEND:");
    console.log("All Keys:", Object.keys(data));
    console.log("nationalId:", data.nationalId);
    console.log("nationality:", data.nationality);
    console.log("prefix:", data.prefix);
    console.log("firstNameEN:", data.firstNameEN);
    console.log("========================================");
    // ====================================

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

    // Helper function to check if parent info is complete
    const isParentInfoComplete = (parent) => {
      return (
        parent &&
        parent.nationalId &&
        parent.nationalId.trim() !== "" &&
        parent.firstName &&
        parent.firstName.trim() !== "" &&
        parent.lastName &&
        parent.lastName.trim() !== "" &&
        parent.dateOfBirth
      );
    };

    // Check if at least one parent/guardian has complete info
    const hasCompleteFather = isParentInfoComplete(data.father);
    const hasCompleteMother = isParentInfoComplete(data.mother);
    const hasCompleteGuardian = isParentInfoComplete(data.guardian);

    if (!hasCompleteFather && !hasCompleteMother && !hasCompleteGuardian) {
      const error = new Error(
        "กรุณากรอกข้อมูลบิดา มารดา หรือผู้ปกครองอย่างน้อย 1 คนให้ครบถ้วน (เลขบัตรประชาชน, ชื่อ, นามสกุล, วันเกิด)",
      );
      error.statusCode = 400;
      throw error;
    }

    let studentProfile = await StudentProfile.findOne({ userId });

    if (studentProfile) {
      logger.info("Updating student profile with data:", {
        keys: Object.keys(data),
      });

      // List of nested object fields that need special handling
      const nestedFields = [
        "previousEducation",
        "address",
        "father",
        "mother",
        "guardian",
        "emergencyContact",
        "education",
      ];

      // Update each field
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) {
          if (
            nestedFields.includes(key) &&
            typeof data[key] === "object" &&
            data[key] !== null
          ) {
            // For nested objects, merge with existing data and mark as modified
            const existingData =
              studentProfile[key]?.toObject?.() || studentProfile[key] || {};
            studentProfile[key] = { ...existingData, ...data[key] };
            studentProfile.markModified(key);
          } else {
            // For primitive fields, direct assignment
            studentProfile[key] = data[key];
          }
        }
      });

      await studentProfile.save();
      logger.info("Student profile updated successfully", { userId });
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
