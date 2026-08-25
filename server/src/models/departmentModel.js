import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    // คณะที่สังกัด
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    // รหัสสาขา เช่น "CPE", "EE", "ME"
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // ชื่อสาขาภาษาไทย
    nameTH: {
      type: String,
      required: true,
      trim: true,
    },

    // ชื่อสาขาภาษาอังกฤษ
    nameEN: {
      type: String,
      trim: true,
      default: "",
    },

    // หัวหน้าสาขา (สามารถแต่งตั้ง/ถอดถอน Class Advisor)
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // สถานะ
    isActive: {
      type: Boolean,
      default: true,
    },

    // จำนวนปีการศึกษาปกติ (4 ปี, 5 ปี, etc.)
    normalYears: {
      type: Number,
      default: 4,
      min: 1,
      max: 8,
    },

    // ข้อมูลติดต่อ
    contact: {
      phone: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      room: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Unique: code must be unique within faculty
departmentSchema.index({ faculty: 1, code: 1 }, { unique: true });
departmentSchema.index({ nameTH: "text", nameEN: "text" });

const Department =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);

export default Department;
