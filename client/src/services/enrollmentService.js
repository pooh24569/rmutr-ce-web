import axios from "axios";

const enrollmentApi = axios.create({
  baseURL: "http://localhost:7001/api",
});

enrollmentApi.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth");
  if (saved) {
    const { token } = JSON.parse(saved);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

enrollmentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const enrollmentService = {

  getAvailableClasses: async () => {
    const response = await enrollmentApi.get("/enrollments/available");
    return response.data;
  },

  getMyEnrollments: async () => {
    const response = await enrollmentApi.get("/enrollments/my");
    return response.data;
  },

  enrollClass: async (classId) => {
    const response = await enrollmentApi.post(`/enrollments/${classId}`);
    return response.data;
  },

  dropClass: async (classId) => {
    const response = await enrollmentApi.delete(`/enrollments/${classId}`);
    return response.data;
  },
};

export default enrollmentService;
