const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware"); // Assuming you have a role middleware
const { canDeleteUser, canAssignRole } = require("../middlewares/policies");
const UserCtrl = require("../controllers/userController"); 


const router = express.Router();

// superadmin can access this route
router.get(
  "/superadmin",
  verifyToken,
  authorizeRoles("superadmin"),
  (req, res) => {
    res.json({ message: "Superadmin route accessed" });
  }
);

//Only admin can access this route
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  (req, res) => {
    res.json({ message: "Admin route accessed" });
  }
);

//Both admin and student can access this route
router.get(
  "/teacher",
  verifyToken,
  authorizeRoles("superadmin", "admin", "teacher"),
  (req, res) => {
    res.json({ message: "Teacher route accessed" });
  }
);

//All student can access this route
router.get(
  "/student",
  verifyToken,
  authorizeRoles("superadmin", "admin", "teacher", "student"),
  (req, res) => {
    res.json({ message: "student route accessed" });
  }
);

router.get(
  "/parent",
  verifyToken,
  authorizeRoles("superadmin", "admin", "parent"),
  (req, res) => {
    res.json({ message: "Parent route accessed" });
  }
);

module.exports = router;
