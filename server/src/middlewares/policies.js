const User = require("../models/userModel");

async function canDeleteUser(req, res, next) {
  const actor = req.user?.role;
  const target = await User.findById(req.params.id).select("role");
  if (!target) return res.status(404).json({ message: "User not found" });

  if (target.role === "superadmin" && actor !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Access denied: Cannot delete superadmin" });
  }
  return next();
}

async function canAssignRole(req, res, next) {
  const actorRole = req.user?.role;
  const requestedRole = req.body?.role;

  // อนุญาตให้ตั้ง superadmin ได้เฉพาะ "superadmin" เท่านั้น
  if (requestedRole === "superadmin" && actorRole !== "superadmin") {
    return res.status(403).json({
      message: "Access denied: Only superadmin can assign superadmin role",
    });
  }

  // บังคับ "มีได้คนเดียว"
  if (requestedRole === "superadmin") {
    // ถ้าเป็นการอัปเดต (มี params.id) และเป้าหมายเดิมก็เป็น superadmin อยู่แล้ว → ผ่าน
    const currentSuper = await User.findOne({ role: "superadmin" }).select(
      "_id"
    );
    if (currentSuper) {
      // กรณีอัปเดต user เดิมที่เป็น superadmin (ไม่เพิ่มจำนวน)
      if (
        req.params?.id &&
        String(currentSuper._id) === String(req.params.id)
      ) {
        return next();
      }
      // มี superadmin อยู่แล้ว และนี่ไม่ใช่คนเดิม → ห้าม
      return res
        .status(403)
        .json({ message: "Only one superadmin is allowed" });
    }
  }

  return next();
}

module.exports = {
  canDeleteUser,
  canAssignRole,
};
