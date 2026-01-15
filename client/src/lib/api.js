import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:7001/api",
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase() || "";

    const isAuthError = status === 401;
    const isUserDeleted =
      message.includes("user not found") ||
      message.includes("unauthorized") ||
      (status === 404 && message.includes("user"));

    if (isAuthError || isUserDeleted) {

      localStorage.removeItem("auth");

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
