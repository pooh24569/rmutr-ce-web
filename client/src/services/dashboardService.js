import axios from "axios";

// สร้าง axios instance สำหรับ dashboard
const dashboardApi = axios.create({
  baseURL: "http://localhost:7001/api",
});

// Request interceptor - แนบ token
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

// Response interceptor - handle auth errors
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
  }
);

/**
 * Dashboard Service - API calls สำหรับ Dashboard
 */
export const dashboardService = {
  /**
   * ดึงข้อมูล Teacher Dashboard
   */
  getTeacherDashboard: async () => {
    const response = await dashboardApi.get("/dashboard/teacher");
    return response.data;
  },

  /**
   * ดึงข้อมูล Admin Dashboard
   */
  getAdminDashboard: async () => {
    const response = await dashboardApi.get("/dashboard/admin");
    return response.data;
  },
};

export default dashboardService;
