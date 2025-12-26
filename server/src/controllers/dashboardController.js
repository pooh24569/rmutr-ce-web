/**
 * Dashboard Controller
 * API สำหรับ Dashboard statistics
 */

import Class from "../models/classModel.js";
import Session from "../models/sessionModel.js";
import Attendance from "../models/attendanceModel.js";
import User from "../models/userModel.js";

/**
 * GET /api/dashboard/teacher
 * ดึงสถิติสำหรับ Teacher Dashboard
 */
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. นับจำนวน Classes ของอาจารย์
    const classes = await Class.find({ teacher: teacherId })
      .populate("students", "_id")
      .lean();

    const totalClasses = classes.length;

    // 2. นับจำนวนนักศึกษาทั้งหมด (unique)
    const studentIds = new Set();
    classes.forEach((cls) => {
      cls.students?.forEach((s) => studentIds.add(s._id.toString()));
    });
    const totalStudents = studentIds.size;

    // 3. คำนวณ attendance rate วันนี้
    const classIds = classes.map((c) => c._id);
    const todaySessions = await Session.find({
      classId: { $in: classIds },
      date: { $gte: today },
    }).lean();

    let attendanceRate = 0;
    if (todaySessions.length > 0) {
      const sessionIds = todaySessions.map((s) => s._id);
      const attendances = await Attendance.find({
        sessionId: { $in: sessionIds },
      }).lean();

      const totalAttendances = attendances.length;
      const presentCount = attendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length;

      attendanceRate =
        totalAttendances > 0
          ? Math.round((presentCount / totalAttendances) * 100)
          : 0;
    }

    // 4. ดึง classes ที่มีเรียนวันนี้
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][today.getDay()];

    const todayClasses = classes
      .filter((cls) => cls.schedule?.some((s) => s.day === dayOfWeek))
      .map((cls) => {
        const todaySchedule = cls.schedule.find((s) => s.day === dayOfWeek);
        return {
          _id: cls._id,
          classCode: cls.classCode,
          className: cls.className,
          section: cls.section,
          time: todaySchedule
            ? `${todaySchedule.startTime} - ${todaySchedule.endTime}`
            : "",
          room: todaySchedule?.room || "-",
          students: cls.students?.length || 0,
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    // 5. ดึง recent sessions
    const recentSessions = await Session.find({
      classId: { $in: classIds },
    })
      .sort({ date: -1 })
      .limit(5)
      .populate("classId", "classCode className")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalClasses,
          totalStudents,
          attendanceRate: `${attendanceRate}%`,
          todayClasses: todayClasses.length,
        },
        todayClasses,
        recentSessions: recentSessions.map((s) => ({
          _id: s._id,
          classCode: s.classId?.classCode,
          className: s.classId?.className,
          date: s.date,
          status: s.status,
          summary: s.summary,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard",
    });
  }
};

/**
 * GET /api/dashboard/admin
 * ดึงสถิติสำหรับ Admin Dashboard
 */
export const getAdminDashboard = async (req, res) => {
  try {
    // นับจำนวน users ตาม role
    const userCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const stats = {
      totalUsers: 0,
      students: 0,
      teachers: 0,
      admins: 0,
    };

    userCounts.forEach((item) => {
      stats.totalUsers += item.count;
      if (item._id === "student") stats.students = item.count;
      if (item._id === "teacher") stats.teachers = item.count;
      if (item._id === "admin" || item._id === "superadmin")
        stats.admins += item.count;
    });

    // นับ classes ทั้งหมด
    stats.totalClasses = await Class.countDocuments();

    // นับ sessions วันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.todaySessions = await Session.countDocuments({
      date: { $gte: today },
    });

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email role createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        stats,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard",
    });
  }
};
