import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["enrolled", "dropped"],
      default: "enrolled",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

enrollmentSchema.index({ student: 1, class: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ class: 1, status: 1 });

const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
