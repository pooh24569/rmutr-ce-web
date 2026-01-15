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

    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
      match: [/^[0-9]{9,10}$|^$/, "Phone number must be 9-10 digits"],
    },
    profileImage: { type: String, default: "" },

    role: {
      type: String,
      enum: ["superadmin", "admin", "teacher", "student", "parent"],
      default: "student",
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],

    verifyOtpHash: { type: String, default: "" },
    verifyOtpExpiry: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    resetOtpHash: { type: String, default: "" },
    resetOtpExpires: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
