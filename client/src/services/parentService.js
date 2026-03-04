import axios from "axios";

const parentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7001/api",
});

const parentService = {
  getStudentInfo: async (token) => {
    const response = await parentApi.get("/parent/student-info", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAttendance: async (token) => {
    const response = await parentApi.get("/parent/attendance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getSchedule: async (token) => {
    const response = await parentApi.get("/parent/schedule", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default parentService;
