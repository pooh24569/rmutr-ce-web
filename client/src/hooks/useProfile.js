import { useState, useEffect, useCallback } from "react";
import { profileService } from "@/services/profileService";
import { toast } from "sonner";

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    } finally {
      setLoading(false);
    }
  }, []);

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

  const uploadImage = async (file) => {
    setLoading(true);
    setError(null);
    try {

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

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

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
