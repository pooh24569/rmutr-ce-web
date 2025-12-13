import mongoose from "mongoose";

/**
 * Class Model - ระบบรายวิชา
 *
 * ใช้สำหรับเก็บข้อมูลรายวิชาที่อาจารย์สร้าง
 * นักศึกษาจะลงทะเบียนเข้า Class เพื่อเช็คชื่อได้
 */
const classSchema = new mongoose.Schema(
  {
    // ข้อมูลวิชา
    classCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // เช่น "MATH101", "CS201"
    },
    className: {
      type: String,
      required: true,
      trim: true,
      // เช่น "คณิตศาสตร์ 1", "การเขียนโปรแกรม"
    },
    section: {
      type: String,
      required: true,
      trim: true,
      // เช่น "01", "02", "A"
    },
    description: {
      type: String,
      default: "",
      // คำอธิบายรายวิชา (optional)
    },

    // ตารางเรียน (สามารถมีหลายวัน/เวลา)
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },
        startTime: {
          type: String, // "09:00"
          required: true,
        },
        endTime: {
          type: String, // "12:00"
          required: true,
        },
        room: {
          type: String, // "ห้อง A101"
          required: true,
          trim: true,
        },
      },
    ],

    // อาจารย์เจ้าของวิชา
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // นักศึกษาที่ลงทะเบียนในวิชา
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ปีการศึกษา / เทอม
    academicYear: {
      type: String, // "2567"
      required: true,
    },
    semester: {
      type: String,
      enum: ["1", "2", "summer"],
      required: true,
    },

    // สถานะ
    isActive: {
      type: Boolean,
      default: true,
    },

    // มาจากระบบทะเบียน (auto-import) หรือสร้างเอง
    isFromRegistration: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index สำหรับค้นหาเร็ว
classSchema.index(
  { classCode: 1, section: 1, academicYear: 1, semester: 1 },
  { unique: true }
);
classSchema.index({ teacher: 1 });
classSchema.index({ students: 1 });

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
export default Class;
