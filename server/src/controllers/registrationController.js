/**
 * Registration Controller
 * จัดการข้อมูลทะเบียน (Mock Data)
 */

import {
  getEnrolledCourses,
  getAllCourses,
  getCourseByCode,
  getTeacherCourses,
} from "../data/mockRegistration.js";
import User from "../models/userModel.js";

/**
 * ดึงรายวิชาที่นักศึกษาลงทะเบียน
 * GET /api/registration/enrolled
 */
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // ดึง studentId จาก StudentProfile
    // ถ้าไม่มี ให้ใช้ username แทน (สำหรับทดสอบ)
    const StudentProfile = (await import("../models/studentProfileModel.js"))
      .default;
    const profile = await StudentProfile.findOne({ userId });

    const studentId = profile?.studentId || req.user.username;

    // ดึงรายวิชาจาก Mock Data
    const courses = getEnrolledCourses(studentId);

    return res.status(200).json({
      success: true,
      data: courses,
      studentId,
      message:
        courses.length > 0
          ? `พบ ${courses.length} รายวิชา`
          : "ไม่พบรายวิชาที่ลงทะเบียน",
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ดึงรายวิชาที่อาจารย์สอน
 * GET /api/registration/teaching
 */
export const getMyTeachingCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // ดึง email และ ชื่อ ของอาจารย์
    const user = await User.findById(userId);
    const teacherEmail = user?.email;
    const teacherName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "";

    // ดึงรายวิชาจาก Mock Data (เทียบทั้ง email และชื่อ)
    const courses = getTeacherCourses(teacherEmail, teacherName);

    return res.status(200).json({
      success: true,
      data: courses,
      teacherEmail,
      teacherName,
      message:
        courses.length > 0
          ? `พบ ${courses.length} รายวิชาที่สอน`
          : "ไม่พบรายวิชาที่สอน (ชื่อหรือ email ไม่ตรงกับ Mock Data)",
    });
  } catch (error) {
    console.error("Error fetching teaching courses:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ดึงรายวิชาทั้งหมด (สำหรับ Admin/อาจารย์)
 * GET /api/registration/courses
 */
export const listAllCourses = async (req, res) => {
  try {
    const courses = getAllCourses();

    return res.status(200).json({
      success: true,
      data: courses,
      total: courses.length,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ดึงรายวิชาตาม courseCode
 * GET /api/registration/courses/:courseCode
 */
export const getCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const course = getCourseByCode(courseCode);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};
