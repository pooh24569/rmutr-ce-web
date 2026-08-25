import User from "../models/userModel.js";

export async function canDeleteUser(req, res, next) {
  const actor = req.user?.role;
  const target = await User.findById(req.params.id).select("role");
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.role === "superadmin" && actor !== "superadmin") {
    return res.status(403).json({ message: "Cannot delete superadmin" });
  }
  next();
}

export async function canAssignRole(req, res, next) {
  const actorRole = req.user?.role;
  const requestedRole = req.body?.role;

  if (requestedRole === "superadmin" && actorRole !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Only superadmin can assign superadmin" });
  }

  if (requestedRole === "superadmin") {
    const currentSuper = await User.findOne({ role: "superadmin" }).select(
      "_id"
    );
    if (currentSuper) {
      if (req.params?.id && String(currentSuper._id) === String(req.params.id))
        return next();
      return res
        .status(403)
        .json({ message: "Only one superadmin is allowed" });
    }
  }
  next();
}
