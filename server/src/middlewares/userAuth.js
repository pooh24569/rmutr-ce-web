import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, ...decoded };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default userAuth;
