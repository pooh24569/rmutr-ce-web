import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dbConnect from "../config/dbConnect.js";
import User from "../models/userModel.js";

await dbConnect();

try {
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
        console.log("⚠️  Superadmin มีอยู่แล้ว:", existing.username);
    } else {
        const password = await bcrypt.hash("123456", 12);
        await User.create({
            username: "superadmin",
            email: "superadmin@rmutr.ac.th",
            password,
            role: "superadmin",
            firstName: "Super",
            lastName: "Admin",
            isVerified: true,
        });
        console.log("Successful");
    }
} catch (err) {
    console.error("Error:", err.message);
}

await mongoose.disconnect();
process.exit(0);
