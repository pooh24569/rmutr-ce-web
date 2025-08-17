const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { canDeleteUser, canAssignRole } = require("../middlewares/policies");
const UserCtrl = require("../controllers/userController");

const router = express.Router();

// list users → superadmin/admin
router.get(
  "/",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  UserCtrl.list
);

// create user → superadmin/admin (admin ห้ามตั้ง superadmin)
router.post(
  "/",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  canAssignRole,
  UserCtrl.create
);

// delete user → superadmin/admin (admin ห้ามลบ superadmin)
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  canDeleteUser,
  UserCtrl.remove
);

module.exports = router;
