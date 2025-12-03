import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["superadmin", "admin", "teacher", "student", "parent"],
      default: "student",
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],

    // Email verification (คงไว้ได้)
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiry: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },

    // Link reset แบบเดิม
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // ✅ OTP reset แบบ hash + หมดอายุ (แทน resetOtp / resetOtpExpireAt เดิม)
    resetOtpHash: { type: String, default: "" },
    resetOtpExpires: { type: Number, default: 0 }, // ms timestamp
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
