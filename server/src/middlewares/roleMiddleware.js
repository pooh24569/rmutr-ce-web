export default function authorizeRoles(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) return res.status(401).json({ message: "Unauthorized" });

    if (allowed.length && !allowed.includes(role)) {
      return res.status(403).json({ message: "Access denied", yourRole: role, allowedRoles: allowed });
    }
    next();
  };
}

