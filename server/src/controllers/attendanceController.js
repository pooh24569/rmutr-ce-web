import Attendance from "../models/attendanceModel.js";
import Session from "../models/sessionModel.js";

export const checkInByFingerprint = async (req, res) => {
  try {
    const { studentId, sessionId, deviceId, location } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session",
      });
    }

    if (session.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Session ปิดแล้ว",
      });
    }

    const attendance = await Attendance.findOne({
      sessionId,
      student: studentId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบนักศึกษาใน Session นี้",
      });
    }

    if (attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: "เช็คชื่อแล้ว",
        data: attendance,
      });
    }

    const now = new Date();
    const checkInTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let status = "PRESENT";

    if (checkInTimeStr > session.lateTime) {
      status = "LATE";
    }

    if (checkInTimeStr > session.endTime) {

      status = "LATE";
    }

    attendance.checkInTime = now;
    attendance.status = status;
    attendance.method = "FINGERPRINT";
    attendance.deviceId = deviceId || "";

    if (location) {
      attendance.location = location;
    }

    await attendance.save();

    if (status === "PRESENT") {
      session.summary.present += 1;
    } else if (status === "LATE") {
      session.summary.late += 1;
    }

    session.summary.absent = Math.max(0, session.summary.absent - 1);
    await session.save();

    await attendance.populate("student", "username firstName lastName");

    return res.status(200).json({
      success: true,
      message: status === "PRESENT" ? "เช็คชื่อสำเร็จ" : "เช็คชื่อสำเร็จ (สาย)",
      data: {
        attendance,
        status,
        checkInTime: checkInTimeStr,
      },
    });
  } catch (error) {
    console.error("Error check-in:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

export const manualCheckIn = async (req, res) => {
  try {
    const { sessionId, studentId, status, note } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session",
      });
    }

    if (session.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "ไม่มีสิทธิ์",
      });
    }

    const attendance = await Attendance.findOne({
      sessionId,
      student: studentId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบนักศึกษา",
      });
    }

    const oldStatus = attendance.status;

    attendance.status = status;
    attendance.method = "MANUAL";
    attendance.note = note || "";
    attendance.modifiedBy = req.user.id;

    if (status !== "ABSENT" && !attendance.checkInTime) {
      attendance.checkInTime = new Date();
    }

    await attendance.save();

    if (oldStatus === "PRESENT") session.summary.present -= 1;
    if (oldStatus === "LATE") session.summary.late -= 1;
    if (oldStatus === "ABSENT") session.summary.absent -= 1;

    if (status === "PRESENT") session.summary.present += 1;
    if (status === "LATE") session.summary.late += 1;
    if (status === "ABSENT") session.summary.absent += 1;

    await session.save();

    await attendance.populate("student", "username firstName lastName");

    return res.status(200).json({
      success: true,
      message: "อัพเดทสำเร็จ",
      data: attendance,
    });
  } catch (error) {
    console.error("Error manual check-in:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { offeringId } = req.params;
    const studentId = req.user.id;

    const attendances = await Attendance.find({
      courseOffering: offeringId,
      student: studentId,
    })
      .populate({
        path: "sessionId",
        select: "date startTime endTime room",
      })
      .sort({ date: -1 });

    const summary = {
      total: attendances.length,
      present: attendances.filter((a) => a.status === "PRESENT").length,
      late: attendances.filter((a) => a.status === "LATE").length,
      absent: attendances.filter((a) => a.status === "ABSENT").length,
      excused: attendances.filter((a) => a.status === "EXCUSED").length,
    };

    summary.attendanceRate =
      summary.total > 0
        ? Math.round(((summary.present + summary.late) / summary.total) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        attendances,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

export const getClassAttendanceSummary = async (req, res) => {
  try {
    const { offeringId } = req.params;

    const totalSessions = await Session.countDocuments({
      courseOffering: offeringId,
      status: "CLOSED",
    });

    const studentSummary = await Attendance.aggregate([
      {
        $match: {
          courseOffering: new (await import("mongoose")).Types.ObjectId(offeringId),
        },
      },
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $project: {
          _id: 1,
          studentInfo: {
            username: "$student.username",
            firstName: "$student.firstName",
            lastName: "$student.lastName",
          },
          total: 1,
          present: 1,
          late: 1,
          absent: 1,
          attendanceRate: {
            $multiply: [
              { $divide: [{ $add: ["$present", "$late"] }, "$total"] },
              100,
            ],
          },
        },
      },
      {
        $sort: { "studentInfo.firstName": 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalSessions,
        students: studentSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};
