import api from "@/lib/api";

export const profileService = {
  getProfile: async () => {
    const { data } = await api.get("/api/profile");
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put("/api/profile", profileData);
    return data;
  },

  updateStudentProfile: async (studentData) => {
    const { data } = await api.put("/api/profile/student", studentData);
    return data;
  },

  uploadProfileImage: async (imageData) => {
    const { data } = await api.post("/api/profile/image", { imageData });
    return data;
  },
};

export default profileService;
