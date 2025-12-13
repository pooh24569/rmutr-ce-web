/**
 * Registration Service
 * Frontend service สำหรับดึงข้อมูลทะเบียน
 */

import api from "@/lib/api";

/**
 * ดึงรายวิชาที่นักศึกษาลงทะเบียน
 * @returns {Promise<Array>} รายวิชาที่ลงทะเบียน
 */
export const getEnrolledCourses = async () => {
  const response = await api.get("/api/registration/enrolled");
  return response.data;
};

/**
 * ดึงรายวิชาทั้งหมด (Admin/Teacher)
 * @returns {Promise<Array>} รายวิชาทั้งหมด
 */
export const getAllCourses = async () => {
  const response = await api.get("/api/registration/courses");
  return response.data;
};

/**
 * ดึงรายวิชาตาม courseCode
 * @param {string} courseCode - รหัสวิชา
 * @returns {Promise<Object>} ข้อมูลรายวิชา
 */
export const getCourseByCode = async (courseCode) => {
  const response = await api.get(`/api/registration/courses/${courseCode}`);
  return response.data;
};

/**
 * ดึงรายวิชาที่อาจารย์สอน
 * @returns {Promise<Array>} รายวิชาที่สอน
 */
export const getTeachingCourses = async () => {
  const response = await api.get("/api/registration/teaching");
  return response.data;
};

export default {
  getEnrolledCourses,
  getAllCourses,
  getCourseByCode,
  getTeachingCourses,
};
