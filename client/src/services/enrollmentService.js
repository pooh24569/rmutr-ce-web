import axios from "axios";

// สร้าง axios instance ใหม่สำหรับ enrollment โดยเฉพาะ
// เพื่อแก้ปัญหา cache
const enrollmentApi = axios.create({
  baseURL: "http://localhost:7001/api",
});

// Request interceptor - แนบ token
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

// Response interceptor - handle auth errors
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

/**
 * Enrollment Service - API calls สำหรับลงทะเบียนวิชา
 */
export const enrollmentService = {
  /**
   * ดึงวิชาที่เปิดให้ลงทะเบียน
   */
  getAvailableClasses: async () => {
    const response = await enrollmentApi.get("/enrollments/available");
    return response.data;
  },

  /**
   * ดึงวิชาที่ลงทะเบียนแล้ว
   */
  getMyEnrollments: async () => {
    const response = await enrollmentApi.get("/enrollments/my");
    return response.data;
  },

  /**
   * ลงทะเบียนวิชา
   * @param {string} classId - ID ของวิชา
   */
  enrollClass: async (classId) => {
    const response = await enrollmentApi.post(`/enrollments/${classId}`);
    return response.data;
  },

  /**
   * ยกเลิกลงทะเบียน
   * @param {string} classId - ID ของวิชา
   */
  dropClass: async (classId) => {
    const response = await enrollmentApi.delete(`/enrollments/${classId}`);
    return response.data;
  },
};

export default enrollmentService;
