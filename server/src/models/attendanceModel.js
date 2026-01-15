import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    checkInTime: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["PRESENT", "LATE", "ABSENT", "EXCUSED"],
      default: "ABSENT",
    },

    method: {
      type: String,
      enum: ["FINGERPRINT", "MANUAL"],
      default: "FINGERPRINT",
    },

    note: {
      type: String,
      default: "",
    },

    deviceId: {
      type: String,
      default: "",
    },

    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attendanceSchema.index({ sessionId: 1, student: 1 }, { unique: true });

attendanceSchema.index({ student: 1, date: -1 });

attendanceSchema.index({ classId: 1, date: -1 });

attendanceSchema.index({ sessionId: 1, status: 1 });

attendanceSchema.virtual("lateMinutes").get(function () {

  return 0;
});

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export default Attendance;
