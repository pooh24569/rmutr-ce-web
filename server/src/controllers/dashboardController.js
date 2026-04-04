import CourseOffering from "../models/courseOfferingModel.js";
import Session from "../models/sessionModel.js";
import Attendance from "../models/attendanceModel.js";
import User from "../models/userModel.js";

// Day mapping: CourseOffering uses short format (mon, tue, ...)
const DAY_INDEX_TO_SHORT = [
  "sun", "mon", "tue", "wed", "thu", "fri", "sat",
];

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const offerings = await CourseOffering.find({ instructor: teacherId })
      .populate("course", "courseCode courseNameTH")
      .populate("students", "_id")
      .lean();

    const totalClasses = offerings.length;

    const studentIds = new Set();
    offerings.forEach((off) => {
      off.students?.forEach((s) => studentIds.add((s._id || s).toString()));
    });
    const totalStudents = studentIds.size;

    const offeringIds = offerings.map((o) => o._id);
    const todaySessions = await Session.find({
      courseOffering: { $in: offeringIds },
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
        (a) => a.status === "PRESENT" || a.status === "LATE",
      ).length;

      attendanceRate =
        totalAttendances > 0
          ? Math.round((presentCount / totalAttendances) * 100)
          : 0;
    }

    const dayOfWeek = DAY_INDEX_TO_SHORT[today.getDay()];

    const todayClasses = offerings
      .filter((off) => off.schedule?.some((s) => s.day === dayOfWeek))
      .map((off) => {
        const todaySchedule = off.schedule.find((s) => s.day === dayOfWeek);
        return {
          _id: off._id,
          classCode: off.course?.courseCode || "",
          className: off.course?.courseNameTH || "",
          section: off.section,
          time: todaySchedule
            ? `${todaySchedule.startTime} - ${todaySchedule.endTime}`
            : "",
          room: todaySchedule?.room || "-",
          students: off.students?.length || 0,
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    const recentSessions = await Session.find({
      courseOffering: { $in: offeringIds },
    })
      .sort({ date: -1 })
      .limit(5)
      .populate({
        path: "courseOffering",
        select: "section",
        populate: {
          path: "course",
          select: "courseCode courseNameTH",
        },
      })
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
          classCode: s.courseOffering?.course?.courseCode,
          className: s.courseOffering?.course?.courseNameTH,
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

export const getAdminDashboard = async (req, res) => {
  try {
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
      if (item._id === "instructor") stats.teachers = item.count;
      if (item._id === "admin" || item._id === "superadmin")
        stats.admins += item.count;
    });

    stats.totalClasses = await CourseOffering.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.todaySessions = await Session.countDocuments({
      date: { $gte: today },
    });

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
