// src/services/classService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7001/api";

// สร้าง axios instance พร้อม auth header
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

export const classService = {
  // ดึง Class ทั้งหมดของอาจารย์
  getMyClasses: async () => {
    try {
      const response = await api.get("/classes/my-classes");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ดึง Class ที่นักศึกษาลงทะเบียน
  getEnrolledClasses: async () => {
    try {
      const response = await api.get("/classes/enrolled");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ดึง Class ตาม ID
  getClassById: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // สร้าง Class ใหม่
  createClass: async (classData) => {
    try {
      const response = await api.post("/classes", classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // อัพเดท Class
  updateClass: async (classId, classData) => {
    try {
      const response = await api.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ลบ Class
  deleteClass: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // เพิ่มนักศึกษาเข้า Class
  addStudent: async (classId, studentId) => {
    try {
      const response = await api.post(`/classes/${classId}/students`, { studentId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ลบนักศึกษาออกจาก Class
  removeStudent: async (classId, studentId) => {
    try {
      const response = await api.delete(`/classes/${classId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ดึงรายชื่อนักศึกษาทั้งหมด
  getAllStudents: async () => {
    try {
      const response = await api.get("/classes/students/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Import นักศึกษาหลายคน (จาก CSV หรือรายการ)
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

