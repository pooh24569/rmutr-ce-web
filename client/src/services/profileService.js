import api from "@/lib/api";

/**
 * Profile API Service
 * Handles all profile-related API calls
 */
export const profileService = {
  /**
   * Get current user's profile
   * @returns {Promise} Profile data
   */
  getProfile: async () => {
    const { data } = await api.get("/api/profile");
    return data;
  },

  /**
   * Update basic user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile
   */
  updateProfile: async (profileData) => {
    const { data } = await api.put("/api/profile", profileData);
    return data;
  },

  /**
   * Update student profile
   * @param {Object} studentData - Student profile data
   * @returns {Promise} Updated student profile
   */
  updateStudentProfile: async (studentData) => {
    const { data } = await api.put("/api/profile/student", studentData);
    return data;
  },

  /**
   * Upload profile image
   * @param {string} imageData - Base64 encoded image
   * @returns {Promise} Upload result
   */
  uploadProfileImage: async (imageData) => {
    const { data } = await api.post("/api/profile/image", { imageData });
    return data;
  },
};

export default profileService;
