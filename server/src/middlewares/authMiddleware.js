const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to request object
      console.log("User authenticated:", req.user);
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Authorization header is missing or malformed" });
  }
};

module.exports = verifyToken;
