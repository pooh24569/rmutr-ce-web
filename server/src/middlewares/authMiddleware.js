import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
