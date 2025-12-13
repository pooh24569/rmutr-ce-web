import { useState, useEffect, useCallback } from "react";
import { profileService } from "@/services/profileService";
import { toast } from "sonner";

/**
 * Custom hook for managing user profile
 * @returns {Object} Profile state and methods
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user profile
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch profile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      // Don't show toast on initial load failure
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update basic profile
   * @param {Object} data - Profile data to update
   */
  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.updateProfile(data);
      if (response.success) {
        setProfile((prev) => ({ ...prev, ...response.data }));
        toast.success("Profile updated successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update student profile
   * @param {Object} data - Student profile data
   */
  const updateStudentProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.updateStudentProfile(data);
      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          studentProfile: response.data,
        }));
        toast.success("Student profile updated successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to update student profile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload profile image
   * @param {File} file - Image file
   */
  const uploadImage = async (file) => {
    setLoading(true);
    setError(null);
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const response = await profileService.uploadProfileImage(base64);
      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          profileImage: response.data.profileImage,
        }));
        toast.success("Profile image uploaded successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to upload image");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert file to base64
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 string
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateStudentProfile,
    uploadImage,
  };
};

export default useProfile;
