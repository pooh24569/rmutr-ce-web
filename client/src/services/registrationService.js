import api from "@/lib/api";

export const getEnrolledCourses = async () => {
  const response = await api.get("/registration/enrolled");
  return response.data;
};

export const getAllCourses = async () => {
  const response = await api.get("/registration/courses");
  return response.data;
};

export const getCourseByCode = async (courseCode) => {
  const response = await api.get(`/api/registration/courses/${courseCode}`);
  return response.data;
};

export const getTeachingCourses = async () => {
  const response = await api.get("/registration/teaching");
  return response.data;
};

export default {
  getEnrolledCourses,
  getAllCourses,
  getCourseByCode,
  getTeachingCourses,
};
