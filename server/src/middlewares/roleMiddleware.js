const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user information found" });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: You do not have the required role" });
    }
    
    return next();// User has the required role, proceed to the next middleware or route handler
  };
};

module.exports = authorizeRoles;
