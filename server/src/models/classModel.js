import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {

    classCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,

    },
    className: {
      type: String,
      required: true,
      trim: true,

    },
    section: {
      type: String,
      required: true,
      trim: true,

    },
    description: {
      type: String,
      default: "",

    },

    schedule: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
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
          required: true,
          trim: true,
        },
      },
    ],

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      enum: ["1", "2", "summer"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFromRegistration: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

classSchema.index(
  { classCode: 1, section: 1, academicYear: 1, semester: 1 },
  { unique: true }
);
classSchema.index({ teacher: 1 });
classSchema.index({ students: 1 });

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
export default Class;
