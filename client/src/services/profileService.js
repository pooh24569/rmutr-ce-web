import api from "@/lib/api";

export const profileService = {
  getProfile: async () => {
    const { data } = await api.get("/profile");
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put("/profile", profileData);
    return data;
  },

  updateStudentProfile: async (studentData) => {
    const { data } = await api.put("/profile/student", studentData);
    return data;
  },

  uploadProfileImage: async (imageData) => {
    const { data } = await api.post("/profile/image", { imageData });
    return data;
  },
};

export default profileService;
