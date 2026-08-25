import axios from "axios";

const dashboardApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7001/api",
});

dashboardApi.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth");
  if (saved) {
    const { token } = JSON.parse(saved);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

dashboardApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const dashboardService = {
  getTeacherDashboard: async () => {
    const response = await dashboardApi.get("/dashboard/teacher");
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await dashboardApi.get("/dashboard/admin");
    return response.data;
  },
};

export default dashboardService;
