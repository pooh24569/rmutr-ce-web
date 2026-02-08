import mongoose from "mongoose";

const courseOfferingSchema = new mongoose.Schema(
  {
    // วิชาที่เปิดสอน
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // อาจารย์ประจำวิชา
    instructor: {
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

    // ภาคการศึกษา
    semester: {
      type: String,
      enum: ["1", "2", "summer"],
      required: true,
    },

    // กลุ่มเรียน/Section
    section: {
      type: String,
      required: true,
      trim: true,
    },

    // จำนวนนักศึกษาสูงสุด
    maxStudents: {
      type: Number,
      default: 40,
    },

    // ตารางเรียน
    schedule: [
      {
        day: {
          type: String,
          enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        room: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    // รายชื่อนักศึกษาที่ลงทะเบียน
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // เปิดให้ลงทะเบียนได้หรือไม่
    registrationOpen: {
      type: Boolean,
      default: false,
    },

    // สถานะ
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
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

// Unique: 1 section per course per semester per academic year
courseOfferingSchema.index(
  { course: 1, academicYear: 1, semester: 1, section: 1 },
  { unique: true },
);

// Indexes for queries
courseOfferingSchema.index({ instructor: 1 });
courseOfferingSchema.index({ academicYear: 1, semester: 1 });
courseOfferingSchema.index({ students: 1 });
courseOfferingSchema.index({ registrationOpen: 1 });

// Virtual: จำนวนนักศึกษาปัจจุบัน
courseOfferingSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

// Virtual: ที่นั่งว่าง
courseOfferingSchema.virtual("availableSeats").get(function () {
  return Math.max(0, this.maxStudents - (this.students?.length || 0));
});

// Virtual: เต็มหรือยัง
courseOfferingSchema.virtual("isFull").get(function () {
  return this.students?.length >= this.maxStudents;
});

// Ensure virtuals are included
courseOfferingSchema.set("toJSON", { virtuals: true });
courseOfferingSchema.set("toObject", { virtuals: true });

const CourseOffering =
  mongoose.models.CourseOffering ||
  mongoose.model("CourseOffering", courseOfferingSchema);

export default CourseOffering;
