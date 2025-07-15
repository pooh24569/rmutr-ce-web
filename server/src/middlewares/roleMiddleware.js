const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied: You do not have the required role" });
        }
        next(); // User has the required role, proceed to the next middleware or route handler

}
}

module.exports = authorizeRoles;
