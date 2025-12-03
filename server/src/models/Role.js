import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    permissions: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scope: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  },
  { timestamps: true }
);

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
export default Role;
