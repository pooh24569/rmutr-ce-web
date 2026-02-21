import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/userModel.js";

const SUPERADMIN_CONFIG = {
  username: "superadmin",
  email: "superadmin@rmutr.ac.th",
  password: "SuperAdmin@2024",
  firstName: "Super",
  lastName: "Admin",
  role: "superadmin",
};

async function seedSuperAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.CONNECTION_STRING;
    if (!mongoUri) {
      console.log("[ERROR] CONNECTION_STRING not found in .env file");
      process.exit(1);
    }

    console.log("[INFO] Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("[OK] Connected to MongoDB");

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { username: SUPERADMIN_CONFIG.username },
        { email: SUPERADMIN_CONFIG.email },
        { role: "superadmin" },
      ],
    });

    if (existingAdmin) {
      console.log("[WARNING] SuperAdmin already exists:");
      console.log("  Username:", existingAdmin.username);
      console.log("  Email:", existingAdmin.email);
      console.log("  Role:", existingAdmin.role);
      console.log("[CANCELLED] Seed cancelled to prevent duplicates.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(SUPERADMIN_CONFIG.password, 12);

    // Create superadmin
    const superadmin = await User.create({
      ...SUPERADMIN_CONFIG,
      password: hashedPassword,
      isAccountVerified: true,
    });

    console.log("");
    console.log("[SUCCESS] SuperAdmin created successfully!");
    console.log("==========================================");
    console.log("  Username:", superadmin.username);
    console.log("  Email:", superadmin.email);
    console.log("  Password:", SUPERADMIN_CONFIG.password);
    console.log("  Role:", superadmin.role);
    console.log("==========================================");
    console.log("");
    console.log("[IMPORTANT] Change the password after first login!");
  } catch (error) {
    console.log("[ERROR]", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("[INFO] Disconnected from MongoDB");
    process.exit(0);
  }
}

seedSuperAdmin();
