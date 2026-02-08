import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    // รหัสคณะ เช่น "ENG", "SCI", "BUS"
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // ชื่อคณะภาษาไทย
    nameTH: {
      type: String,
      required: true,
      trim: true,
    },

    // ชื่อคณะภาษาอังกฤษ
    nameEN: {
      type: String,
      trim: true,
      default: "",
    },

    // คณบดี (หัวหน้าคณะ)
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // สถานะ
    isActive: {
      type: Boolean,
      default: true,
    },

    // ข้อมูลติดต่อ
    contact: {
      phone: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      building: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
facultySchema.index({ code: 1 });
facultySchema.index({ nameTH: "text", nameEN: "text" });

const Faculty =
  mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);

export default Faculty;
