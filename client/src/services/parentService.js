import axios from "axios";

const parentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7001/api",
});

const parentService = {
  login: async (data) => {
    const response = await parentApi.post("/parent/login", data);
    return response.data;
  },

  getStudentInfo: async () => {
    const token = localStorage.getItem("parentToken");
    const response = await parentApi.get("/parent/student-info", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAttendance: async () => {
    const token = localStorage.getItem("parentToken");
    const response = await parentApi.get("/parent/attendance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getSchedule: async () => {
    const token = localStorage.getItem("parentToken");
    const response = await parentApi.get("/parent/schedule", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("parentToken");
    localStorage.removeItem("parentData");
  },
};

export default parentService;
