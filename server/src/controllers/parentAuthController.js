/**
 * parentAuthController.js
 *
 * API handlers for parent-facing data endpoints.
 * Authentication uses the standard /auth/login + JWT flow.
 * Parent users are linked to their children via User.linkedStudents[].
 */

import User from "../models/userModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import { logger } from "../utils/logger.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// In the new parent login system, the JWT token's `id` IS the student's userId.
// So linkedStudents is simply [parentUserId].
const getLinkedStudents = async (parentUserId) => {
  return [parentUserId];
};

const notFound = (res, msg = "ไม่พบข้อมูล") => res.status(404).json({ success: false, message: msg });
const serverError = (res, err, context) => {
  logger.error(context, { error: err.message });
  return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

export const getStudentInfo = async (req, res) => {
  try {
    const studentIds = await getLinkedStudents(req.user.id);
    if (!studentIds.length) return notFound(res, "ไม่พบข้อมูลนักศึกษา");

    const students = await Promise.all(
      studentIds.map(async (studentUserId) => {
        const [user, profile] = await Promise.all([
          User.findById(studentUserId).select("-password"),
          StudentProfile.findOne({ userId: studentUserId }),
        ]);
        if (!user) return null;
        return {
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
          },
          profile: profile
            ? {
                studentId: profile.studentId,
                firstNameTH: profile.firstNameTH,
                lastNameTH: profile.lastNameTH,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                address: profile.address,
                education: profile.education,
              }
            : null,
        };
      })
    );

    res.json({ success: true, data: students.filter(Boolean) });
  } catch (err) {
    serverError(res, err, "getStudentInfo error");
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const studentIds = await getLinkedStudents(req.user.id);
    if (!studentIds.length) return notFound(res);

    const Attendance = (await import("../models/attendanceModel.js")).default;

    const allAttendance = await Promise.all(
      studentIds.map(async (studentUserId) => {
        const [user, attendances] = await Promise.all([
          User.findById(studentUserId).select("firstName lastName"),
          Attendance.find({ student: studentUserId })
            .populate({
              path: "sessionId",
              populate: {
                path: "courseOffering",
                select: "section",
                populate: {
                  path: "course",
                  select: "courseCode courseNameTH",
                },
              },
            })
            .sort({ createdAt: -1 })
            .limit(50),
        ]);

        const summary = {
          total: attendances.length,
          present: attendances.filter((a) => a.status === "PRESENT").length,
          late: attendances.filter((a) => a.status === "LATE").length,
          absent: attendances.filter((a) => a.status === "ABSENT").length,
        };

        return {
          studentId: studentUserId,
          studentName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
          summary,
          records: attendances,
        };
      })
    );

    res.json({ success: true, data: allAttendance });
  } catch (err) {
    serverError(res, err, "getStudentAttendance error");
  }
};

export const getStudentSchedule = async (req, res) => {
  try {
    const studentIds = await getLinkedStudents(req.user.id);
    if (!studentIds.length) return notFound(res);

    const CourseOffering = (await import("../models/courseOfferingModel.js")).default;

    const allSchedules = await Promise.all(
      studentIds.map(async (studentUserId) => {
        const [user, offerings] = await Promise.all([
          User.findById(studentUserId).select("firstName lastName"),
          CourseOffering.find({ students: studentUserId })
            .populate("course", "courseCode courseNameTH credits")
            .populate("instructor", "firstName lastName"),
        ]);

        return {
          studentId: studentUserId,
          studentName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
          classes: offerings.map((off) => ({
            _id: off._id,
            classCode: off.course?.courseCode || "",
            className: off.course?.courseNameTH || "",
            section: off.section,
            schedule: off.schedule,
            teacher: off.instructor,
          })),
        };
      })
    );

    res.json({ success: true, data: allSchedules });
  } catch (err) {
    serverError(res, err, "getStudentSchedule error");
  }
};
