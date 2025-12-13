import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // DEBUG: Log the role check
    console.log("🔐 Auth Check:", {
      userRole: req.user?.role,
      allowedRoles: allowedRoles,
      userId: req.user?.id,
    });

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
        yourRole: req.user?.role, // Show what role was received
        allowedRoles: allowedRoles,
      });
    }
    next();
  };
}

// ให้ default export ชี้ไปที่ authenticate — เพื่อรองรับ import แบบ default ที่มีอยู่
export default authenticate;
