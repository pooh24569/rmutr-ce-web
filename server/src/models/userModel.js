import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
      match: [/^[0-9]{9,10}$|^$/, "Phone number must be 9-10 digits"],
    },
    profileImage: { type: String, default: "" },

    // ===== Role System =====
    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "central_registrar", // ทะเบียนกลาง
        "faculty_registrar", // เจ้าหน้าที่ทะเบียนคณะ
        "dept_head", // หัวหน้าสาขา
        "instructor", // อาจารย์ประจำวิชา
        "student",
        "parent",
      ],
      default: "student",
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],

    // ===== Role Scoping =====
    // คณะที่สังกัด (for faculty_registrar, dept_head, instructor)
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },

    // สาขาที่สังกัด (for dept_head, instructor)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // ===== Parent Linking =====
    // เชื่อม parent กับ student (รองรับลูกหลายคน)
    linkedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],

    // ประเภทผู้ปกครอง
    parentType: {
      type: String,
      enum: ["father", "mother", "guardian", ""],
      default: "",
    },

    // เลขบัตรประชาชนผู้ปกครอง (ใช้ match กรณีลูกคนที่ 2 ลงทะเบียน)
    nationalId: {
      type: String,
      trim: true,
      default: "",
    },

    // ===== Advisor Flags =====
    // เป็นอาจารย์ประจำห้อง (Class Advisor)
    isClassAdvisor: {
      type: Boolean,
      default: false,
    },

    // ===== Account Verification =====
    verifyOtpHash: { type: String, default: "" },
    verifyOtpExpiry: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    resetOtpHash: { type: String, default: "" },
    resetOtpExpires: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
