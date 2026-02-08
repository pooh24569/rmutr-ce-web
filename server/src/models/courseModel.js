import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    // รหัสวิชา เช่น "CPE101", "MATH201"
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // ชื่อวิชาภาษาไทย
    courseNameTH: {
      type: String,
      required: true,
      trim: true,
    },

    // ชื่อวิชาภาษาอังกฤษ
    courseNameEN: {
      type: String,
      trim: true,
      default: "",
    },

    // หน่วยกิต
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    // คณะเจ้าของวิชา
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },

    // สาขาเจ้าของวิชา
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // รายละเอียดวิชา
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // วิชาที่ต้องผ่านก่อน (Prerequisite)
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // ประเภทวิชา
    courseType: {
      type: String,
      enum: ["required", "elective", "general", "free"],
      default: "required",
    },

    // สถานะ
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ผู้สร้าง (Registrar)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ faculty: 1, department: 1 });
courseSchema.index({ courseNameTH: "text", courseNameEN: "text" });

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
