import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Student ID (รหัสนักศึกษา)
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{13}$/, "Student ID must be exactly 13 digits"],
    },

    // Thai Name
    firstNameTH: {
      type: String,
      trim: true,
      default: "",
    },
    lastNameTH: {
      type: String,
      trim: true,
      default: "",
    },

    // Personal Information
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    // Student Card Information
    cardIssueDate: {
      type: Date,
      default: null,
    },
    cardExpiryDate: {
      type: Date,
      default: null,
    },

    // Address
    address: {
      street: { type: String, trim: true, default: "" },
      district: { type: String, trim: true, default: "" },
      province: { type: String, trim: true, default: "" },
      postalCode: {
        type: String,
        trim: true,
        default: "",
        match: [/^[0-9]{5}$|^$/, "Postal code must be 5 digits"],
      },
    },

    // Education Information
    education: {
      faculty: { type: String, trim: true, default: "" },
      department: { type: String, trim: true, default: "" },
      year: {
        type: Number,
        min: 1,
        max: 6,
        default: null,
      },
      gpa: {
        type: Number,
        min: 0,
        max: 4.0,
        default: null,
      },
    },

    // Emergency Contact
    emergencyContact: {
      name: { type: String, trim: true, default: "" },
      relationship: { type: String, trim: true, default: "" },
      phoneNumber: {
        type: String,
        trim: true,
        default: "",
        match: [/^[0-9]{9,13}$|^$/, "Phone number must be 9-13 digits"],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster queries
studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ studentId: 1 });

const StudentProfile =
  mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
