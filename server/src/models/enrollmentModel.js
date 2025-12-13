import mongoose from "mongoose";

/**
 * Enrollment Model - ระบบลงทะเบียนวิชา
 *
 * ใช้สำหรับเก็บข้อมูลการลงทะเบียนของนักศึกษา
 */
const enrollmentSchema = new mongoose.Schema(
  {
    // นักศึกษาที่ลงทะเบียน
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // วิชาที่ลงทะเบียน
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // วันที่ลงทะเบียน
    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    // สถานะ
    status: {
      type: String,
      enum: ["enrolled", "dropped"],
      default: "enrolled",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index สำหรับค้นหาเร็ว
enrollmentSchema.index({ student: 1, class: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ class: 1, status: 1 });

const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
