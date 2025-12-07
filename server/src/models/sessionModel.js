import mongoose from "mongoose";

/**
 * ============================================================
 * 📚 Session Model - ระบบเปิด-ปิดเรียน
 * ============================================================
 * 
 * Session คืออะไร?
 * - เมื่ออาจารย์กด "เปิดเรียน" ระบบจะสร้าง Session ใหม่
 * - Session เก็บข้อมูลว่า: วิชาอะไร, ห้องไหน, เวลาเริ่ม-สาย-ปิด
 * - นักศึกษาสแกนนิ้วจะบันทึกเข้า Session นี้
 * - เมื่ออาจารย์กด "ปิดเรียน" จะเปลี่ยนสถานะเป็น CLOSED
 * 
 * Flow การทำงาน:
 * 1. อาจารย์กด "เปิดเรียน" → สร้าง Session (status: OPEN)
 * 2. นักศึกษาสแกนนิ้ว → สร้าง Attendance บันทึกเวลา
 * 3. ระบบเช็คว่า มา/สาย/ขาด ตามเวลาที่ตั้งไว้
 * 4. อาจารย์กด "ปิดเรียน" → เปลี่ยน status เป็น CLOSED
 * 5. คนที่ไม่ได้สแกน → ถูกบันทึกเป็น "ขาด"
 * ============================================================
 */

const sessionSchema = new mongoose.Schema(
  {
    // ============================
    // 🔗 ความสัมพันธ์
    // ============================
    
    // วิชาที่เปิดสอน (อ้างอิงจาก Class Model)
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // อาจารย์ที่เปิดสอน
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ============================
    // ⏰ การตั้งเวลา
    // ============================
    
    // วันที่สอน
    date: {
      type: Date,
      required: true,
      default: () => {
        // ตั้งเป็นวันนี้ เวลา 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
    },

    // เวลาเริ่มเรียน (เช่น "09:00")
    startTime: {
      type: String,
      required: true,
    },

    // เวลาที่ถือว่า "สาย" (เช่น "09:15" = สาย 15 นาที)
    lateTime: {
      type: String,
      required: true,
    },

    // เวลาปิดรับเช็คชื่อ (เช่น "09:30")
    endTime: {
      type: String,
      required: true,
    },

    // เวลาจบคลาส (เช่น "12:00")
    classEndTime: {
      type: String,
      required: true,
    },

    // ============================
    // 📍 สถานที่
    // ============================
    
    // ห้องเรียน
    room: {
      type: String,
      required: true,
      trim: true,
    },

    // รหัสเครื่องสแกน (ถ้ามี)
    deviceId: {
      type: String,
      default: "",
    },

    // ============================
    // 📊 สถานะ
    // ============================
    
    /**
     * สถานะ Session:
     * - OPEN: กำลังเปิดรับเช็คชื่อ
     * - CLOSED: ปิดแล้ว (อาจารย์กดปิด หรือหมดเวลา)
     * - CANCELLED: ยกเลิก
     */
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "CANCELLED"],
      default: "OPEN",
    },

    // หมายเหตุ (เช่น "เลิกเรียนก่อน")
    note: {
      type: String,
      default: "",
    },

    // ============================
    // 📈 สรุปผล (คำนวณหลังปิด)
    // ============================
    
    summary: {
      totalStudents: { type: Number, default: 0 },  // นักศึกษาทั้งหมด
      present: { type: Number, default: 0 },         // มาเรียน
      late: { type: Number, default: 0 },            // สาย
      absent: { type: Number, default: 0 },          // ขาด
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================
// 🔍 Indexes สำหรับค้นหาเร็ว
// ============================

// ค้นหา Session ตามวิชาและวันที่
sessionSchema.index({ classId: 1, date: 1 });

// ค้นหา Session ที่เปิดอยู่
sessionSchema.index({ status: 1 });

// ค้นหา Session ของอาจารย์
sessionSchema.index({ teacher: 1, date: -1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session;
