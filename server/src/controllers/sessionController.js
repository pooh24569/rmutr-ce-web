import Session from "../models/sessionModel.js";
import Attendance from "../models/attendanceModel.js";
import Class from "../models/classModel.js";

/**
 * ============================================================
 * 🎓 Session Controller - จัดการเปิด-ปิดเรียน
 * ============================================================
 */

/**
 * 🟢 เปิดเรียน (Start Session)
 * 
 * Flow:
 * 1. ตรวจสอบว่าอาจารย์เป็นเจ้าของวิชา
 * 2. ตรวจสอบว่าไม่มี Session ที่เปิดอยู่
 * 3. สร้าง Session ใหม่
 * 4. สร้าง Attendance records สำหรับนักศึกษาทุกคน (เริ่มต้นเป็น ABSENT)
 * 5. ส่ง Response กลับ
 */
export const startSession = async (req, res) => {
  try {
    const {
      classId,
      date,           // วันที่ (optional, default = วันนี้)
      startTime,      // เวลาเริ่ม เช่น "09:00"
      lateAfterMinutes, // สายหลังกี่นาที เช่น 15
      closeAfterMinutes, // ปิดหลังกี่นาที เช่น 30
      classEndTime,   // เวลาจบคลาส เช่น "12:00"
      room,
      deviceId,
    } = req.body;

    // 1️⃣ ตรวจสอบว่าวิชามีอยู่จริง
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // 2️⃣ ตรวจสอบว่าเป็นอาจารย์เจ้าของวิชา
    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์เปิดเรียนวิชานี้",
      });
    }

    // 3️⃣ ตรวจสอบว่าไม่มี Session ที่เปิดอยู่
    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = await Session.findOne({
      classId,
      date: today,
      status: "OPEN",
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: "มี Session ที่เปิดอยู่แล้ว",
        data: existingSession,
      });
    }

    // 4️⃣ คำนวณเวลา
    const [startHour, startMinute] = startTime.split(":").map(Number);
    
    // เวลาสาย = เวลาเริ่ม + lateAfterMinutes
    const lateDate = new Date(today);
    lateDate.setHours(startHour, startMinute + (lateAfterMinutes || 15), 0, 0);
    const lateTime = `${String(lateDate.getHours()).padStart(2, "0")}:${String(lateDate.getMinutes()).padStart(2, "0")}`;

    // เวลาปิด = เวลาเริ่ม + closeAfterMinutes
    const closeDate = new Date(today);
    closeDate.setHours(startHour, startMinute + (closeAfterMinutes || 30), 0, 0);
    const endTime = `${String(closeDate.getHours()).padStart(2, "0")}:${String(closeDate.getMinutes()).padStart(2, "0")}`;

    // 5️⃣ สร้าง Session
    const session = new Session({
      classId,
      teacher: req.user.id,
      date: today,
      startTime,
      lateTime,
      endTime,
      classEndTime: classEndTime || endTime,
      room,
      deviceId: deviceId || "",
      status: "OPEN",
      summary: {
        totalStudents: classData.students.length,
        present: 0,
        late: 0,
        absent: classData.students.length, // เริ่มต้นทุกคนเป็นขาด
      },
    });

    await session.save();

    // 6️⃣ สร้าง Attendance records สำหรับนักศึกษาทุกคน
    const attendanceRecords = classData.students.map((studentId) => ({
      sessionId: session._id,
      classId,
      student: studentId,
      date: today,
      status: "ABSENT", // เริ่มต้นเป็นขาด
      checkInTime: null,
    }));

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }

    // 7️⃣ ส่ง Response พร้อมข้อมูล Session
    const populatedSession = await Session.findById(session._id)
      .populate("classId", "classCode className section")
      .populate("teacher", "firstName lastName");

    return res.status(201).json({
      success: true,
      message: "เปิดเรียนสำเร็จ",
      data: populatedSession,
    });
  } catch (error) {
    console.error("Error starting session:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปิดเรียน",
      error: error.message,
    });
  }
};

/**
 * 🔴 ปิดเรียน (Close Session)
 * 
 * Flow:
 * 1. เปลี่ยนสถานะ Session เป็น CLOSED
 * 2. อัพเดทสรุปผล (present, late, absent)
 */
export const closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session",
      });
    }

    // ตรวจสอบสิทธิ์
    if (session.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์ปิด Session นี้",
      });
    }

    if (session.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Session นี้ปิดไปแล้ว",
      });
    }

    // นับสรุปผล
    const attendanceStats = await Attendance.aggregate([
      { $match: { sessionId: session._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      totalStudents: session.summary.totalStudents,
      present: 0,
      late: 0,
      absent: 0,
    };

    attendanceStats.forEach((stat) => {
      if (stat._id === "PRESENT") summary.present = stat.count;
      if (stat._id === "LATE") summary.late = stat.count;
      if (stat._id === "ABSENT") summary.absent = stat.count;
    });

    // อัพเดท Session
    session.status = "CLOSED";
    session.summary = summary;
    await session.save();

    return res.status(200).json({
      success: true,
      message: "ปิดเรียนสำเร็จ",
      data: session,
    });
  } catch (error) {
    console.error("Error closing session:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * 📋 ดึง Session ที่เปิดอยู่ของอาจารย์
 */
export const getOpenSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      teacher: req.user.id,
      status: "OPEN",
    })
      .populate("classId", "classCode className section")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * 📊 ดึงรายละเอียด Session พร้อม Attendance
 */
export const getSessionDetail = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
      .populate("classId", "classCode className section")
      .populate("teacher", "firstName lastName");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session",
      });
    }

    // ดึงรายชื่อ Attendance
    const attendances = await Attendance.find({ sessionId })
      .populate("student", "username firstName lastName email")
      .sort({ status: 1, checkInTime: 1 });

    return res.status(200).json({
      success: true,
      data: {
        session,
        attendances,
      },
    });
  } catch (error) {
    console.error("Error fetching session detail:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * 📅 ดึงประวัติ Session ของวิชา
 */
export const getClassSessions = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const sessions = await Session.find({ classId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments({ classId });

    return res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching class sessions:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};
