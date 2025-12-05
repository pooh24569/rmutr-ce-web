import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:7001",
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

export default api;
