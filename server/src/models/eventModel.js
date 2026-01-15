
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: [
        "holiday",
        "exam",
        "homework",
        "meeting",
        "personal",
        "class",
        "other",
      ],
      default: "personal",
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["private", "public", "class", "school"],
      default: "private",
    },
    location: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ createdBy: 1, startDate: 1 });

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
export default Event;
