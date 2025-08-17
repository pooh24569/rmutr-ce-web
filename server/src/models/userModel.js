const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["superadmin", "admin", "teacher", "student", "parent"],
      default: "student",
      
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId, ref : "Role",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
