const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// GET /api/user-admin  → list users
exports.list = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: "List users failed" });
  }
};

// POST /api/user-admin  → create user (admin/superadmin เท่านั้น)
exports.create = async (req, res) => {
  try {
    const { username = "", password = "", role } = req.body;

    if (!username.trim() || !password) {
      return res.status(400).json({ message: "username & password required" });
    }

    const exists = await User.findOne({ username: username.trim() });
    if (exists) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      password: hashed,
      role, // ไม่ส่งมาก็ default 'student' ตาม schema
    });

    const { _id, username: u, role: r } = user.toObject();
    return res.status(201).json({ id: _id, username: u, role: r });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Username already taken" });
    }
    return res.status(500).json({ message: "Create user failed" });
  }
};

// DELETE /api/user-admin/:id  → delete user
exports.remove = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Deleted" });
  } catch (e) {
    return res.status(500).json({ message: "Delete user failed" });
  }
};
