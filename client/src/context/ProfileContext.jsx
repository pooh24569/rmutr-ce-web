// src/context/ProfileContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { profileService } from "@/services/profileService";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

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

export const ProfileProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch user profile
     */
    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated) return;

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
            console.error("Profile fetch error:", errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

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

    // Fetch profile when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [isAuthenticated, fetchProfile]);

    const value = {
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        updateStudentProfile,
        uploadImage,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    // ถ้าไม่มี context ให้ return default values แทน throw error
    if (!context) {
        return {
            profile: null,
            loading: false,
            error: null,
            fetchProfile: () => { },
            updateProfile: async () => { },
            updateStudentProfile: async () => { },
            uploadImage: async () => { },
        };
    }
    return context;
};

export default ProfileContext;
