import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  // ✅ FIX: Return proper 401 status code
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ FIX: Use req.user instead of modifying req.body
    req.user = { id: decoded.id, ...decoded };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default userAuth;
