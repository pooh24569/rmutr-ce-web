import axios from "axios";

const homeworkApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7001/api",
});

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
  },
);

export const homeworkService = {
  createHomework: async (data) => {
    const response = await homeworkApi.post("/homework", data);
    return response.data;
  },

  getSubmissions: async (homeworkId) => {
    const response = await homeworkApi.get(
      `/homework/${homeworkId}/submissions`,
    );
    return response.data;
  },

  gradeSubmission: async (submissionId, score, feedback) => {
    const response = await homeworkApi.put(
      `/homework/submissions/${submissionId}/grade`,
      {
        score,
        feedback,
      },
    );
    return response.data;
  },

  deleteHomework: async (homeworkId) => {
    const response = await homeworkApi.delete(`/homework/${homeworkId}`);
    return response.data;
  },

  getMyHomework: async () => {
    const response = await homeworkApi.get("/homework/my");
    return response.data;
  },

  submitHomework: async (homeworkId, content, files = []) => {
    const formData = new FormData();
    formData.append("content", content);

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
      },
    );
    return response.data;
  },

  getHomeworkByOffering: async (offeringId) => {
    const response = await homeworkApi.get(`/homework/offering/${offeringId}`);
    return response.data;
  },

  getHomeworkById: async (homeworkId) => {
    const response = await homeworkApi.get(`/homework/${homeworkId}`);
    return response.data;
  },
};

export default homeworkService;
