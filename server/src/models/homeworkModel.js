/**
 * Homework Model - ระบบการบ้าน
 */

import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
  {
    // วิชาที่สั่งการบ้าน
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // อาจารย์ผู้สั่ง
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // หัวข้อการบ้าน
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // รายละเอียด
    description: {
      type: String,
      default: "",
    },

    // คะแนนเต็ม
    maxScore: {
      type: Number,
      default: 100,
    },

    // กำหนดส่ง
    dueDate: {
      type: Date,
      required: true,
    },

    // ไฟล์แนบจากอาจารย์ (optional)
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],

    // สถานะ
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index
homeworkSchema.index({ class: 1, dueDate: 1 });
homeworkSchema.index({ teacher: 1 });

const Homework =
  mongoose.models.Homework || mongoose.model("Homework", homeworkSchema);
export default Homework;
