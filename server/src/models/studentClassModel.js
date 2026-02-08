import mongoose from "mongoose";

const studentClassSchema = new mongoose.Schema(
  {
    // สาขาที่สังกัด
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    // ปีการศึกษา เช่น "2569"
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    // ชั้นปี (1-8)
    yearLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    // ห้อง/Section เช่น "1", "2", "A", "B"
    section: {
      type: String,
      required: true,
      trim: true,
    },

    // อาจารย์ประจำห้อง (Class Advisor / Homeroom Teacher)
    classAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // รายชื่อนักศึกษาในห้อง
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // จำนวนนักศึกษาสูงสุด
    maxStudents: {
      type: Number,
      default: 40,
    },

    // ชื่อห้อง (auto-generated or custom)
    displayName: {
      type: String,
      trim: true,
      default: "",
    },

    // สถานะ
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Unique: 1 section per year level per academic year per department
studentClassSchema.index(
  { department: 1, academicYear: 1, yearLevel: 1, section: 1 },
  { unique: true },
);

// Index for finding classes by advisor
studentClassSchema.index({ classAdvisor: 1 });

// Index for finding classes with students
studentClassSchema.index({ students: 1 });

// Virtual: จำนวนนักศึกษาปัจจุบัน
studentClassSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

// Virtual: ห้องเต็มหรือยัง
studentClassSchema.virtual("isFull").get(function () {
  return this.students?.length >= this.maxStudents;
});

// Pre-save: auto-generate displayName if empty
studentClassSchema.pre("save", async function (next) {
  if (!this.displayName) {
    const dept = await mongoose.model("Department").findById(this.department);
    this.displayName = `${dept?.code || ""} ปี ${this.yearLevel} ห้อง ${this.section}`;
  }
  next();
});

// Ensure virtuals are included in JSON
studentClassSchema.set("toJSON", { virtuals: true });
studentClassSchema.set("toObject", { virtuals: true });

const StudentClass =
  mongoose.models.StudentClass ||
  mongoose.model("StudentClass", studentClassSchema);

export default StudentClass;
