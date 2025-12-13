import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:7001/api",
});

// Request interceptor - แนบ token ไปกับทุก request
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth");

  if (saved) {
    const { token } = JSON.parse(saved);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - จัดการ auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase() || "";

    // ตรวจจับเมื่อ:
    // 1. 401 Unauthorized (token หมดอายุ หรือไม่ถูกต้อง)
    // 2. User ถูกลบ (User not found / Unauthorized)
    const isAuthError = status === 401;
    const isUserDeleted =
      message.includes("user not found") ||
      message.includes("unauthorized") ||
      (status === 404 && message.includes("user"));

    if (isAuthError || isUserDeleted) {
      // ลบ auth data
      localStorage.removeItem("auth");

      // Redirect ไป Login (ยกเว้นถ้าอยู่หน้า Login อยู่แล้ว)
      if (!window.location.pathname.includes("/login")) {
        console.log(
          "🔐 Session expired or user deleted. Redirecting to login..."
        );
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
