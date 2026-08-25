import {
  getEnrolledCourses,
  getAllCourses,
  getCourseByCode,
  getTeacherCourses,
} from "../data/mockRegistration.js";
import User from "../models/userModel.js";

export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const StudentProfile = (await import("../models/studentProfileModel.js"))
      .default;
    const profile = await StudentProfile.findOne({ userId });

    const studentId = profile?.studentId || req.user.username;

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

export const getMyTeachingCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    const teacherEmail = user?.email;
    const teacherName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "";

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
