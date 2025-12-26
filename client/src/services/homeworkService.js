import axios from "axios";

// สร้าง axios instance สำหรับ homework
const homeworkApi = axios.create({
  baseURL: "http://localhost:7001/api",
});

// Request interceptor - แนบ token
homeworkApi.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth");
  if (saved) {
    const { token } = JSON.parse(saved);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
homeworkApi.interceptors.response.use(
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
 * Homework Service - API calls สำหรับระบบการบ้าน
 */
export const homeworkService = {
  // ==========================================
  // Teacher
  // ==========================================

  // สร้างการบ้าน
  createHomework: async (data) => {
    const response = await homeworkApi.post("/homework", data);
    return response.data;
  },

  // ดู submissions
  getSubmissions: async (homeworkId) => {
    const response = await homeworkApi.get(
      `/homework/${homeworkId}/submissions`
    );
    return response.data;
  },

  // ให้คะแนน
  gradeSubmission: async (submissionId, score, feedback) => {
    const response = await homeworkApi.put(
      `/homework/submissions/${submissionId}/grade`,
      {
        score,
        feedback,
      }
    );
    return response.data;
  },

  // ลบการบ้าน
  deleteHomework: async (homeworkId) => {
    const response = await homeworkApi.delete(`/homework/${homeworkId}`);
    return response.data;
  },

  // ==========================================
  // Student
  // ==========================================

  // ดูการบ้านทั้งหมดของตัวเอง
  getMyHomework: async () => {
    const response = await homeworkApi.get("/homework/my");
    return response.data;
  },

  // ส่งการบ้าน (รองรับการส่งไฟล์)
  submitHomework: async (homeworkId, content, files = []) => {
    const formData = new FormData();
    formData.append("content", content);

    // แนบไฟล์ทั้งหมด
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await homeworkApi.post(
      `/homework/${homeworkId}/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // ==========================================
  // Shared
  // ==========================================

  // ดูการบ้านของวิชา
  getHomeworkByClass: async (classId) => {
    const response = await homeworkApi.get(`/homework/class/${classId}`);
    return response.data;
  },

  // ดูรายละเอียดการบ้าน
  getHomeworkById: async (homeworkId) => {
    const response = await homeworkApi.get(`/homework/${homeworkId}`);
    return response.data;
  },
};

export default homeworkService;
