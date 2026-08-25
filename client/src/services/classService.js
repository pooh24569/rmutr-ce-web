
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

export const classService = {

  getMyClasses: async () => {
    try {
      const response = await api.get("/classes/my-classes");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getEnrolledClasses: async () => {
    try {
      const response = await api.get("/classes/enrolled");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getClassById: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createClass: async (classData) => {
    try {
      const response = await api.post("/classes", classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateClass: async (classId, classData) => {
    try {
      const response = await api.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteClass: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addStudent: async (classId, studentId) => {
    try {
      const response = await api.post(`/classes/${classId}/students`, { studentId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeStudent: async (classId, studentId) => {
    try {
      const response = await api.delete(`/classes/${classId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllStudents: async () => {
    try {
      const response = await api.get("/classes/students/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  importStudents: async (classId, studentIds) => {
    try {
      const response = await api.post(`/classes/${classId}/import`, { studentIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default classService;

