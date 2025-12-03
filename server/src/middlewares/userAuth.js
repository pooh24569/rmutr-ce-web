import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch {
    return res.json({ success: false, message: "Unauthorized" });
  }
};

export default userAuth;
