// src/services/sessionService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7001/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// เพิ่ม token ใน header ทุก request
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

export const sessionService = {
  /**
   * เปิดเรียน (Start Session)
   */
  startSession: async (data) => {
    try {
      const response = await api.post("/sessions/start", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ปิดเรียน (Close Session)
   */
  closeSession: async (sessionId) => {
    try {
      const response = await api.patch(`/sessions/${sessionId}/close`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ดึง Session ที่เปิดอยู่
   */
  getOpenSessions: async () => {
    try {
      const response = await api.get("/sessions/open");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ดึงรายละเอียด Session พร้อม Attendance
   */
  getSessionDetail: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ดึงประวัติ Session ของวิชา
   */
  getClassSessions: async (classId, params = {}) => {
    try {
      const response = await api.get(`/sessions/class/${classId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * เช็คชื่อ Manual (อาจารย์เช็คให้)
   */
  manualCheckIn: async (data) => {
    try {
      const response = await api.post("/attendance/manual", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ดูสรุปการเข้าเรียนของวิชา
   */
  getClassAttendanceSummary: async (classId) => {
    try {
      const response = await api.get(`/attendance/summary/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default sessionService;
