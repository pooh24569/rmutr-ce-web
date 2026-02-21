import jwt from "jsonwebtoken";
import StudentProfile from "../models/studentProfileModel.js";
import User from "../models/userModel.js";

// Helper function to compare dates (ignore time)
const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const parentLogin = async (req, res) => {
  try {
    const { studentId, nationalId, firstName, lastName, dateOfBirth } =
      req.body;

    // Validate required fields
    if (!studentId || !nationalId || !firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
    }

    // Find student by student ID
    const studentProfile = await StudentProfile.findOne({ studentId }).populate(
      "userId",
    );

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลนักศึกษา",
      });
    }

    const user = studentProfile.userId;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    // Check against father, mother, or guardian
    const parentSources = ["father", "mother", "guardian"];
    let matchedParent = null;
    let parentType = null;

    for (const source of parentSources) {
      const parent = studentProfile[source];
      if (
        parent &&
        parent.nationalId &&
        parent.nationalId === nationalId &&
        parent.firstName?.toLowerCase() === firstName.toLowerCase() &&
        parent.lastName?.toLowerCase() === lastName.toLowerCase() &&
        isSameDate(parent.dateOfBirth, dateOfBirth)
      ) {
        matchedParent = parent;
        parentType = source;
        break;
      }
    }

    if (!matchedParent) {
      return res.status(401).json({
        success: false,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: `parent_${studentProfile._id}`,
        studentId: studentProfile.studentId,
        role: "parent",
        parentType, // father, mother, or guardian
        studentUserId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      data: {
        studentId: studentProfile.studentId,
        studentName: `${studentProfile.firstNameTH || user.firstName} ${studentProfile.lastNameTH || user.lastName}`,
        parentName: `${matchedParent.firstName} ${matchedParent.lastName}`,
        parentType,
        role: "parent",
      },
    });
  } catch (error) {
    console.error("Parent login error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
};

export const getStudentInfo = async (req, res) => {
  try {
    const { studentUserId } = req.user;

    const user = await User.findById(studentUserId).select("-password");
    const profile = await StudentProfile.findOne({ userId: studentUserId });

    if (!user || !profile) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลนักศึกษา",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
        },
        profile: {
          studentId: profile.studentId,
          firstNameTH: profile.firstNameTH,
          lastNameTH: profile.lastNameTH,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          education: profile.education,
        },
      },
    });
  } catch (error) {
    console.error("Get student info error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentUserId } = req.user;

    const Attendance = (await import("../models/attendanceModel.js")).default;
    const attendances = await Attendance.find({ student: studentUserId })
      .populate({
        path: "sessionId",
        populate: { path: "classId", select: "classCode className" },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const summary = {
      total: attendances.length,
      present: attendances.filter((a) => a.status === "PRESENT").length,
      late: attendances.filter((a) => a.status === "LATE").length,
      absent: attendances.filter((a) => a.status === "ABSENT").length,
    };

    res.json({
      success: true,
      data: {
        summary,
        records: attendances,
      },
    });
  } catch (error) {
    console.error("Get student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
};

export const getStudentSchedule = async (req, res) => {
  try {
    const { studentUserId } = req.user;

    const Enrollment = (await import("../models/enrollmentModel.js")).default;
    const enrollments = await Enrollment.find({
      student: studentUserId,
      status: "enrolled",
    }).populate({
      path: "class",
      populate: { path: "teacher", select: "firstName lastName" },
    });

    const classes = enrollments.map((e) => e.class).filter(Boolean);

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Get student schedule error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
};
