

import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {

    homework: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homework",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    score: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    gradedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["submitted", "graded", "returned"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

submissionSchema.index({ homework: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;
