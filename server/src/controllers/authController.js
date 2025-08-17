const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res
        .status(409)
        .json({ message: `User with username ${username} already exists` });
    }
    const allowedPublicRoles = ["student", "teacher", "parent"];
    if (role && !allowedPublicRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: `Role ${role} is not allowed for public registration` });
    }
    const finalRole = role && allowedPublicRoles.includes(role) ? role : "student"; 

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: finalRole,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: `User registered with username ${username}` });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with username ${username} not found` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: `User logged in with username ${username}`,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  register,
  login,
};
