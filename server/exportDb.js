
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const OUTPUT_DIR = path.join(__dirname, "db_export");

async function exportDatabase() {
  try {

    const uri =
      process.env.CONNECTION_STRING || "mongodb://localhost:27017/Rmutr";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");


    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }


    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📦 Found ${collections.length} collections`);


    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = mongoose.connection.db.collection(collectionName);

  
      const documents = await collection.find({}).toArray();

  
      const filePath = path.join(OUTPUT_DIR, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), "utf8");

      console.log(`    ${collectionName}: ${documents.length} documents`);
    }

    console.log(`\n Export complete! Files saved to: ${OUTPUT_DIR}`);
    console.log("\n ไฟล์ที่ได้:");
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
