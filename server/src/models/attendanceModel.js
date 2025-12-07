import mongoose from "mongoose";

/**
 * ============================================================
 * 📋 Attendance Model - บันทึกการเช็คชื่อ
 * ============================================================
 * 
 * Attendance คืออะไร?
 * - เมื่อนักศึกษาสแกนนิ้ว ระบบจะสร้าง Attendance record
 * - เก็บข้อมูล: ใคร, วิชาอะไร, เวลาไหน, สถานะอะไร
 * 
 * สถานะ (status):
 * - PRESENT: มาเรียน (สแกนก่อนเวลาสาย)
 * - LATE: สาย (สแกนหลังเวลาสาย แต่ก่อนปิด)
 * - ABSENT: ขาด (ไม่ได้สแกน จนกว่าจะปิด Session)
 * 
 * วิธีบันทึก (method):
 * - FINGERPRINT: สแกนลายนิ้วมือ
 * - MANUAL: อาจารย์เช็คชื่อให้ (กรณีพิเศษ)
 * ============================================================
 */

const attendanceSchema = new mongoose.Schema(
  {
    // ============================
    // 🔗 ความสัมพันธ์
    // ============================
    
    // Session ที่เช็คชื่อ (อ้างอิง Session Model)
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    // วิชา (สำหรับ query เร็วขึ้น ไม่ต้อง join)
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // นักศึกษา
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ============================
    // ⏰ เวลา
    // ============================
    
    // วันที่เช็คชื่อ
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // เวลาที่สแกน (timestamp)
    checkInTime: {
      type: Date,
      default: null, // null = ยังไม่ได้สแกน (ขาด)
    },

    // ============================
    // 📊 สถานะ
    // ============================
    
    /**
     * สถานะการเข้าเรียน:
     * - PRESENT: มาเรียน
     * - LATE: สาย
     * - ABSENT: ขาด
     * - EXCUSED: ลา (มีใบลา)
     */
    status: {
      type: String,
      enum: ["PRESENT", "LATE", "ABSENT", "EXCUSED"],
      default: "ABSENT", // เริ่มต้นเป็นขาด จนกว่าจะสแกน
    },

    /**
     * วิธีเช็คชื่อ:
     * - FINGERPRINT: สแกนลายนิ้วมือ
     * - MANUAL: อาจารย์เช็คชื่อให้
     */
    method: {
      type: String,
      enum: ["FINGERPRINT", "MANUAL"],
      default: "FINGERPRINT",
    },

    // ============================
    // 📝 ข้อมูลเพิ่มเติม
    // ============================
    
    // หมายเหตุ (เช่น "มาสาย 5 นาที", "ป่วย")
    note: {
      type: String,
      default: "",
    },

    // รหัสเครื่องสแกนที่ใช้
    deviceId: {
      type: String,
      default: "",
    },

    // GPS (ถ้าใช้)
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    // อาจารย์ที่แก้ไข (กรณี MANUAL)
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================
// 🔍 Indexes
// ============================

// ป้องกันเช็คชื่อซ้ำ: 1 นักศึกษา 1 Session
attendanceSchema.index({ sessionId: 1, student: 1 }, { unique: true });

// ค้นหาประวัติของนักศึกษา
attendanceSchema.index({ student: 1, date: -1 });

// ค้นหาตามวิชา
attendanceSchema.index({ classId: 1, date: -1 });

// ค้นหาตามสถานะ
attendanceSchema.index({ sessionId: 1, status: 1 });

// ============================
// 📊 Virtual: คำนวณระยะเวลาที่สาย
// ============================

attendanceSchema.virtual("lateMinutes").get(function () {
  // คำนวณว่าสายกี่นาที (ใช้ใน Frontend)
  // ต้อง populate session มาด้วย
  return 0; // จะคำนวณใน Controller
});

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export default Attendance;
