import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {

    courseOffering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOffering",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: () => {

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
    },

    startTime: {
      type: String,
      required: true,
    },

    lateTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    classEndTime: {
      type: String,
      required: true,
    },

    room: {
      type: String,
      required: true,
      trim: true,
    },

    deviceId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "CANCELLED"],
      default: "OPEN",
    },

    note: {
      type: String,
      default: "",
    },

    summary: {
      totalStudents: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sessionSchema.index({ courseOffering: 1, date: 1 });

sessionSchema.index({ status: 1 });

sessionSchema.index({ teacher: 1, date: -1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session;
