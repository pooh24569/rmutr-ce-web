import "dotenv/config";
import mongoose from "mongoose";
import Faculty from "../src/models/facultyModel.js";
import Department from "../src/models/departmentModel.js";

// รายการสาขาที่ต้องการเพิ่ม (ใส่ภายใต้คณะโดยใช้รหัสคณะ)
const DEPARTMENTS = [
  {
    facultyCode: "ENG",
    code: "CPE",
    nameTH: "วิศวกรรมคอมพิวเตอร์",
    nameEN: "Computer Engineering",
  },
  {
    facultyCode: "ENG",
    code: "CE",
    nameTH: "วิศวโยธา",
    nameEN: "Civil Engineering",
  },
  {
    facultyCode: "ENG",
    code: "EE",
    nameTH: "วิศวกรรมไฟฟ้า",
    nameEN: "Electrical Engineering",
  },
];

async function seedDepartments() {
  try {
    const mongoUri = process.env.CONNECTION_STRING;
    if (!mongoUri) {
      console.error("[ERROR] CONNECTION_STRING not found in .env");
      process.exit(1);
    }

    console.log("[INFO] Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("[OK] Connected to MongoDB");

    for (const d of DEPARTMENTS) {
      const faculty = await Faculty.findOne({ code: d.facultyCode });
      if (!faculty) {
        console.warn(
          `[SKIP] Faculty not found for code=${d.facultyCode}, skipping department ${d.code}`,
        );
        continue;
      }

      const exists = await Department.findOne({
        faculty: faculty._id,
        code: d.code,
      });

      if (exists) {
        console.log(`[SKIP] Department already exists: ${d.code} (${d.nameTH})`);
        continue;
      }

      const created = await Department.create({
        faculty: faculty._id,
        code: d.code,
        nameTH: d.nameTH,
        nameEN: d.nameEN || "",
        isActive: true,
      });

      console.log(`[CREATED] ${created.code} - ${created.nameTH} (faculty: ${d.facultyCode})`);
    }

    console.log("[DONE] Seeding departments finished.");
  } catch (err) {
    console.error("[ERROR]", err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDepartments();
