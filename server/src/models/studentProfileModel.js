import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ===== 1. ข้อมูลส่วนบุคคล (Personal Information) =====
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{13}$/, "Student ID must be exactly 13 digits"],
    },
    nationality: { type: String, trim: true, default: "" },
    nationalId: { type: String, trim: true, default: "" },
    cardIssueDate: { type: Date, default: null },
    cardExpiryDate: { type: Date, default: null },
    prefix: { type: String, trim: true, default: "" },
    firstNameTH: { type: String, trim: true, default: "" },
    lastNameTH: { type: String, trim: true, default: "" },
    firstNameEN: { type: String, trim: true, default: "" },
    lastNameEN: { type: String, trim: true, default: "" },
    dateOfBirth: { type: Date, default: null },
    birthProvince: { type: String, trim: true, default: "" },
    ethnicity: { type: String, trim: true, default: "" },
    religion: { type: String, trim: true, default: "" },
    bloodType: { type: String, enum: ["A", "B", "AB", "O", ""], default: "" },
    maritalStatus: { type: String, trim: true, default: "" },
    talents: { type: String, trim: true, default: "" },
    sports: { type: String, trim: true, default: "" },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    // ===== 2. ข้อมูลการศึกษาเดิม (Previous Education) =====
    previousEducation: {
      schoolName: { type: String, trim: true, default: "" },
      qualification: { type: String, trim: true, default: "" },
      graduationDate: { type: Date, default: null },
      gpa: { type: Number, min: 0, max: 4.0, default: null },
    },

    // ===== 3. ข้อมูลที่อยู่ (Address) =====
    address: {
      houseCode: { type: String, trim: true, default: "" },
      village: { type: String, trim: true, default: "" },
      houseNumber: { type: String, trim: true, default: "" },
      moo: { type: String, trim: true, default: "" },
      soi: { type: String, trim: true, default: "" },
      road: { type: String, trim: true, default: "" },
      province: { type: String, trim: true, default: "" },
      district: { type: String, trim: true, default: "" },
      subDistrict: { type: String, trim: true, default: "" },
      postalCode: { type: String, trim: true, default: "" },
      homePhone: { type: String, trim: true, default: "" },
      mobilePhone: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
    },

    // ===== 4. ข้อมูลบิดา (Father Information) =====
    father: {
      nationality: { type: String, trim: true, default: "" },
      nationalId: { type: String, trim: true, default: "" },
      prefix: { type: String, trim: true, default: "" },
      firstName: { type: String, trim: true, default: "" },
      lastName: { type: String, trim: true, default: "" },
      status: { type: String, trim: true, default: "" },
      education: { type: String, trim: true, default: "" },
      dateOfBirth: { type: Date, default: null },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },

    // ===== 5. ข้อมูลมารดา (Mother Information) =====
    mother: {
      nationality: { type: String, trim: true, default: "" },
      nationalId: { type: String, trim: true, default: "" },
      prefix: { type: String, trim: true, default: "" },
      firstName: { type: String, trim: true, default: "" },
      lastName: { type: String, trim: true, default: "" },
      status: { type: String, trim: true, default: "" },
      education: { type: String, trim: true, default: "" },
      dateOfBirth: { type: Date, default: null },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },

    // ===== 6. ข้อมูลผู้ปกครอง (Guardian Information) =====
    guardian: {
      nationality: { type: String, trim: true, default: "" },
      nationalId: { type: String, trim: true, default: "" },
      prefix: { type: String, trim: true, default: "" },
      firstName: { type: String, trim: true, default: "" },
      lastName: { type: String, trim: true, default: "" },
      relationship: { type: String, trim: true, default: "" },
      dateOfBirth: { type: Date, default: null },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },

    // ===== 7. ข้อมูลติดต่อฉุกเฉิน (Emergency Contact) =====
    emergencyContact: {
      prefix: { type: String, trim: true, default: "" },
      firstName: { type: String, trim: true, default: "" },
      lastName: { type: String, trim: true, default: "" },
    },

    // ===== Current Education (kept for compatibility) =====
    education: {
      faculty: { type: String, trim: true, default: "" },
      department: { type: String, trim: true, default: "" },
      year: { type: Number, min: 1, max: 6, default: null },
      gpa: { type: Number, min: 0, max: 4.0, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes are automatically created by unique: true in schema

const StudentProfile =
  mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
