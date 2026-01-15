

import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
  {

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    maxScore: {
      type: Number,
      default: 100,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],

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

homeworkSchema.index({ class: 1, dueDate: 1 });
homeworkSchema.index({ teacher: 1 });

const Homework =
  mongoose.models.Homework || mongoose.model("Homework", homeworkSchema);
export default Homework;
