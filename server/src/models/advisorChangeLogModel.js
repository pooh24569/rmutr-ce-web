import mongoose from "mongoose";

const advisorChangeLogSchema = new mongoose.Schema(
  {
    // ประเภทการเปลี่ยนแปลง
    action: {
      type: String,
      enum: ["assigned", "removed", "transferred"],
      required: true,
    },

    // อาจารย์ที่ถูกแต่งตั้ง/ถอดถอน
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ห้องเรียนที่เกี่ยวข้อง
    studentClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentClass",
      required: true,
    },

    // อาจารย์คนก่อน (กรณี transfer)
    previousAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ผู้ทำการเปลี่ยนแปลง (Dept Head)
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // เหตุผล
    reason: {
      type: String,
      trim: true,
      default: "",
    },

    // ปีการศึกษาที่เปลี่ยนแปลง
    academicYear: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for audit queries
advisorChangeLogSchema.index({ instructor: 1, createdAt: -1 });
advisorChangeLogSchema.index({ studentClass: 1, createdAt: -1 });
advisorChangeLogSchema.index({ changedBy: 1, createdAt: -1 });
advisorChangeLogSchema.index({ academicYear: 1 });

// Static: get history for a class
advisorChangeLogSchema.statics.getClassHistory = async function (classId) {
  return this.find({ studentClass: classId })
    .populate("instructor", "firstName lastName")
    .populate("previousAdvisor", "firstName lastName")
    .populate("changedBy", "firstName lastName")
    .sort({ createdAt: -1 });
};

// Static: get instructor's advisor history
advisorChangeLogSchema.statics.getInstructorHistory = async function (
  instructorId,
) {
  return this.find({ instructor: instructorId })
    .populate("studentClass", "displayName")
    .populate("changedBy", "firstName lastName")
    .sort({ createdAt: -1 });
};

const AdvisorChangeLog =
  mongoose.models.AdvisorChangeLog ||
  mongoose.model("AdvisorChangeLog", advisorChangeLogSchema);

export default AdvisorChangeLog;
