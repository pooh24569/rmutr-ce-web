import "dotenv/config";
import mongoose from "mongoose";
import Faculty from "../src/models/facultyModel.js";

// ปรับรายการคณะที่ต้องการเพิ่มที่นี่
const FACULTIES = [
  { code: "ENG", nameTH: "คณะวิศวกรรมศาสตร์", nameEN: "Engineering" },
  { code: "SCI", nameTH: "คณะวิทยาศาสตร์", nameEN: "Science" },
];

async function seedFaculties() {
  try {
    const mongoUri = process.env.CONNECTION_STRING;
    if (!mongoUri) {
      console.error("[ERROR] CONNECTION_STRING not found in .env");
      process.exit(1);
    }

    console.log("[INFO] Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("[OK] Connected to MongoDB");

    for (const f of FACULTIES) {
      const exists = await Faculty.findOne({ $or: [{ code: f.code }, { nameTH: f.nameTH }] });
      if (exists) {
        console.log(`[SKIP] Faculty already exists: ${f.code} (${f.nameTH})`);
        continue;
      }

      const created = await Faculty.create({ ...f, isActive: true });
      console.log(`[CREATED] ${created.code} - ${created.nameTH}`);
    }

    console.log("[DONE] Seeding faculties finished.");
  } catch (err) {
    console.error("[ERROR]", err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedFaculties();
