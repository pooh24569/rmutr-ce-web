export default function authorizeRoles(...allowed) {
  return (req, res, next) => {
    
    const role = req.user?.role;
    
    // Debug logging
    console.log("🔐 Role Check:", {
      userId: req.user?.id,
      userRole: role,
      allowedRoles: allowed,
      isAllowed: allowed.includes(role),
    });
    
    if (!role) return res.status(401).json({ message: "Unauthorized" });

    if (allowed.length && !allowed.includes(role)) {
      return res.status(403).json({ message: "Access denied", yourRole: role, allowedRoles: allowed });
    }
    next();
  };
}

