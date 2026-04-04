
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7001/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

export const sessionService = {

  startSession: async (data) => {
    try {
      const response = await api.post("/sessions/start", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  closeSession: async (sessionId) => {
    try {
      const response = await api.patch(`/sessions/${sessionId}/close`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getOpenSessions: async () => {
    try {
      const response = await api.get("/sessions/open");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSessionDetail: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getOfferingSessions: async (offeringId, params = {}) => {
    try {
      const response = await api.get(`/sessions/offering/${offeringId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  manualCheckIn: async (data) => {
    try {
      const response = await api.post("/attendance/manual", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAttendanceSummary: async (offeringId) => {
    try {
      const response = await api.get(`/attendance/summary/${offeringId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default sessionService;
