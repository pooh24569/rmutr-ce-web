import api from "@/lib/api";

// ===== Course Catalog =====

export const getCourses = async (params = {}) => {
  const { data } = await api.get("/courses", { params });
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const createCourse = async (courseData) => {
  const { data } = await api.post("/courses", courseData);
  return data;
};

export const updateCourse = async (id, courseData) => {
  const { data } = await api.put(`/courses/${id}`, courseData);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

// ===== Course Offerings =====

export const getCourseOfferings = async (params = {}) => {
  const { data } = await api.get("/courses/offerings/list", { params });
  return data;
};

export const getCourseOfferingById = async (id) => {
  const { data } = await api.get(`/courses/offerings/${id}`);
  return data;
};

export const createCourseOffering = async (offeringData) => {
  const { data } = await api.post("/courses/offerings", offeringData);
  return data;
};

export const updateCourseOffering = async (id, offeringData) => {
  const { data } = await api.put(`/courses/offerings/${id}`, offeringData);
  return data;
};

export const deleteCourseOffering = async (id) => {
  const { data } = await api.delete(`/courses/offerings/${id}`);
  return data;
};

export const toggleRegistration = async (id) => {
  const { data } = await api.patch(`/courses/offerings/${id}/toggle-registration`);
  return data;
};

export const updateOfferingSchedule = async (id, schedule) => {
  const { data } = await api.put(`/courses/offerings/${id}/schedule`, { schedule });
  return data;
};

// ===== Enrollment =====

export const enrollStudents = async (offeringId, studentIds) => {
  const { data } = await api.post(`/courses/offerings/${offeringId}/enroll`, { studentIds });
  return data;
};

export const removeStudentFromOffering = async (offeringId, studentId) => {
  const { data } = await api.delete(`/courses/offerings/${offeringId}/students/${studentId}`);
  return data;
};

// ===== Instructors =====

export const getInstructors = async (params = {}) => {
  const { data } = await api.get("/courses/instructors", { params });
  return data;
};

// ===== Classes (for registrar) =====

export const getAllClasses = async (params = {}) => {
  const { data } = await api.get("/classes/all", { params });
  return data;
};

export const createClass = async (classData) => {
  const { data } = await api.post("/classes", classData);
  return data;
};

export const updateClass = async (classId, classData) => {
  const { data } = await api.put(`/classes/${classId}`, classData);
  return data;
};

export const deleteClass = async (classId) => {
  const { data } = await api.delete(`/classes/${classId}`);
  return data;
};

// ===== Faculties & Departments (for dropdowns) =====

export const getFaculties = async () => {
  const { data } = await api.get("/academic/faculties");
  return data;
};

export const getDepartments = async (facultyId) => {
  if (!facultyId) return { success: true, data: [] };
  const { data } = await api.get(`/academic/departments/${facultyId}`);
  return data;
};
