import mongoose from "mongoose";

const studentAcademicRecordSchema = new mongoose.Schema(
  {
    // นักศึกษา
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ปีการศึกษา เช่น "2569"
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    // ชั้นปีที่ (1-8)
    yearLevel: {
      type: Number,
      min: 1,
      max: 8,
    },

    // ห้องเรียนที่สังกัด
    studentClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentClass",
      default: null,
    },

    // คณะ
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },

    // สาขา
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // เกรดเฉลี่ยประจำปี
    gpa: {
      type: Number,
      min: 0,
      max: 4.0,
      default: null,
    },

    // หน่วยกิตสะสม
    totalCredits: {
      type: Number,
      default: 0,
    },

    // สถานะ
    status: {
      type: String,
      enum: ["enrolled", "graduated", "withdrawn", "suspended", "on_leave"],
      default: "enrolled",
    },

    // หมายเหตุ
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Unique: 1 record per student per academic year
studentAcademicRecordSchema.index(
  { student: 1, academicYear: 1 },
  { unique: true },
);

// Index for queries
studentAcademicRecordSchema.index({ student: 1, status: 1 });
studentAcademicRecordSchema.index({ faculty: 1, academicYear: 1 });
studentAcademicRecordSchema.index({ department: 1, academicYear: 1 });

// Pre-save: enforce 8-year limit
studentAcademicRecordSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      student: this.student,
    });
    if (count >= 8) {
      const error = new Error(
        "ไม่สามารถเพิ่มปีการศึกษาได้ เนื่องจากมีข้อมูลครบ 8 ปีแล้ว",
      );
      error.code = "MAX_YEARS_EXCEEDED";
      return next(error);
    }
  }
  next();
});

// Static: get student's academic history
studentAcademicRecordSchema.statics.getStudentHistory = async function (
  studentId,
) {
  return this.find({ student: studentId })
    .populate("faculty", "code nameTH")
    .populate("department", "code nameTH")
    .populate("studentClass", "displayName classAdvisor")
    .sort({ academicYear: -1 });
};

// Static: check if student can add new year
studentAcademicRecordSchema.statics.canAddNewYear = async function (studentId) {
  const count = await this.countDocuments({ student: studentId });
  return count < 8;
};

// Static: get remaining years
studentAcademicRecordSchema.statics.getRemainingYears = async function (
  studentId,
) {
  const count = await this.countDocuments({ student: studentId });
  return Math.max(0, 8 - count);
};

const StudentAcademicRecord =
  mongoose.models.StudentAcademicRecord ||
  mongoose.model("StudentAcademicRecord", studentAcademicRecordSchema);

export default StudentAcademicRecord;
