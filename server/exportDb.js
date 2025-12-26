/**
 * Export MongoDB Database to JSON files
 * รันด้วย: node exportDb.js
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้างโฟลเดอร์ output
const OUTPUT_DIR = path.join(__dirname, "db_export");

async function exportDatabase() {
  try {
    // เชื่อมต่อ MongoDB
    const uri =
      process.env.CONNECTION_STRING || "mongodb://localhost:27017/Rmutr";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // สร้างโฟลเดอร์ output
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // ดึงรายชื่อ collections ทั้งหมด
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📦 Found ${collections.length} collections`);

    // Export แต่ละ collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = mongoose.connection.db.collection(collectionName);

      // ดึงข้อมูลทั้งหมด
      const documents = await collection.find({}).toArray();

      // เขียนไฟล์ JSON
      const filePath = path.join(OUTPUT_DIR, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), "utf8");

      console.log(`   ✅ ${collectionName}: ${documents.length} documents`);
    }

    console.log(`\n🎉 Export complete! Files saved to: ${OUTPUT_DIR}`);
    console.log("\n📁 ไฟล์ที่ได้:");
    fs.readdirSync(OUTPUT_DIR).forEach((file) => {
      console.log(`   - ${file}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

exportDatabase();
