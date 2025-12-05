import * as profileService from "../services/profileService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { logger } from "../utils/logger.js";

/**
 * Get user profile
 * GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const profile = await profileService.getUserProfile(userId);

    return res.json(successResponse(profile, "Profile retrieved successfully"));
  } catch (error) {
    logger.error("Get profile error", { error: error.message });
    const statusCode = error.statusCode || 500;
    return res
      .status(statusCode)
      .json(errorResponse(error.message || "Failed to get profile"));
  }
};

/**
 * Update basic user profile
 * PUT /api/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const updatedUser = await profileService.updateUserProfile(userId, data);

    return res.json(
      successResponse(updatedUser, "Profile updated successfully")
    );
  } catch (error) {
    logger.error("Update profile error", { error: error.message });
    const statusCode = error.statusCode || 500;
    return res
      .status(statusCode)
      .json(errorResponse(error.message || "Failed to update profile"));
  }
};

/**
 * Update student profile
 * PUT /api/profile/student
 */
export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const studentProfile = await profileService.updateStudentProfile(
      userId,
      data
    );

    return res.json(
      successResponse(studentProfile, "Student profile updated successfully")
    );
  } catch (error) {
    logger.error("Update student profile error", { error: error.message });
    const statusCode = error.statusCode || 500;
    return res
      .status(statusCode)
      .json(errorResponse(error.message || "Failed to update student profile"));
  }
};

/**
 * Upload profile image
 * POST /api/profile/image
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json(errorResponse("Image data is required"));
    }

    const result = await profileService.uploadProfileImage(userId, imageData);

    return res.json(
      successResponse(result, "Profile image uploaded successfully")
    );
  } catch (error) {
    logger.error("Upload profile image error", { error: error.message });
    const statusCode = error.statusCode || 500;
    return res
      .status(statusCode)
      .json(errorResponse(error.message || "Failed to upload profile image"));
  }
};

export default {
  getProfile,
  updateProfile,
  updateStudentProfile,
  uploadProfileImage,
};
