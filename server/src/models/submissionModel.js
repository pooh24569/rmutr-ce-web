/**
 * Submission Model - งานที่นักศึกษาส่ง
 */

import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // การบ้านที่ส่ง
    homework: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homework",
      required: true,
    },

    // นักศึกษาที่ส่ง
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ข้อความที่ส่งพร้อมงาน
    content: {
      type: String,
      default: "",
    },

    // ไฟล์ที่แนบ
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // วันที่ส่ง
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // ส่งช้าหรือไม่
    isLate: {
      type: Boolean,
      default: false,
    },

    // คะแนน (อาจารให้)
    score: {
      type: Number,
      default: null,
    },

    // Feedback จากอาจารย์
    feedback: {
      type: String,
      default: "",
    },

    // วันที่ให้คะแนน
    gradedAt: {
      type: Date,
      default: null,
    },

    // สถานะ
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

// Index - unique per homework + student
submissionSchema.index({ homework: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;
