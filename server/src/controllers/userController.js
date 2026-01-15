import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";

export async function list(_req, res) {
  try {
    const users = await userModel.find().select("-password");
    return res.json(users);
  } catch {
    return res.status(500).json({ message: "List users failed" });
  }
}

export async function create(req, res) {
  try {
    const { username = "", password = "", role, email = "" } = req.body;
    if (!username.trim() || !password || !email.trim()) {
      return res
        .status(400)
        .json({ message: "username, email, password required" });
    }

    const exists = await userModel.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim().toLowerCase() },
      ],
    });
    if (exists)
      return res
        .status(409)
        .json({ message: "Username or email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role,
    });

    const { _id, username: u, role: r, email: em } = user.toObject();
    return res.status(201).json({ id: _id, username: u, role: r, email: em });
  } catch (e) {
    if (e?.code === 11000)
      return res.status(409).json({ message: "Duplicate key" });
    return res.status(500).json({ message: "Create user failed" });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await userModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Deleted" });
  } catch {
    return res.status(500).json({ message: "Delete user failed" });
  }
}

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
