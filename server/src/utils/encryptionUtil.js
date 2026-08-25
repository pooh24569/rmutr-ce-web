/**
 * ===================================================================
 * 🔐 Encryption Utility — AES-256-GCM
 * ===================================================================
 *
 * ใช้สำหรับเข้ารหัส/ถอดรหัส Fingerprint Template ก่อนเก็บลง MongoDB
 *
 * เหตุผลที่เลือก AES-256-GCM:
 * 1. AES-256 → ระดับการเข้ารหัสสูงสุด (Military-grade)
 * 2. GCM (Galois/Counter Mode) → ให้ทั้ง Confidentiality + Integrity
 *    (ตรวจจับได้หาก data ถูก tamper)
 * 3. ป้องกัน Padding Oracle Attack (ซึ่ง CBC mode มีช่องโหว่)
 *
 * PDPA Compliance:
 * - ข้อมูลชีวภาพ (Biometric) เป็นข้อมูลอ่อนไหว ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล มาตรา 26
 * - ต้องใช้มาตรการรักษาความปลอดภัยที่เหมาะสม → AES-256-GCM
 * - Key ต้องเก็บใน environment variable ห้าม hardcode เด็ดขาด
 *
 * ===================================================================
 */

import crypto from "crypto";

// --- Configuration ---
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 16 bytes = 128 bits (มาตรฐานสำหรับ GCM)
const AUTH_TAG_LENGTH = 16; // 16 bytes = 128 bits (GCM authentication tag)

/**
 * ดึง Encryption Key จาก Environment Variable
 *
 * Key ต้องยาว 32 bytes (256 bits) สำหรับ AES-256
 * ถ้ายังไม่มี key จะ throw error ทันที (fail-fast principle)
 *
 * @returns {Buffer} - Encryption key (32 bytes)
 * @throws {Error} - ถ้าไม่มี key หรือ key ยาวไม่ถูกต้อง
 */
function getEncryptionKey() {
  const keyHex = process.env.FINGERPRINT_ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error(
      "FINGERPRINT_ENCRYPTION_KEY is not set in environment variables. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  const key = Buffer.from(keyHex, "hex");

  if (key.length !== 32) {
    throw new Error(
      `FINGERPRINT_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Got ${keyHex.length} hex chars.`,
    );
  }

  return key;
}

/**
 * เข้ารหัส Fingerprint Template ด้วย AES-256-GCM
 *
 * ขั้นตอน:
 * 1. สร้าง IV (Initialization Vector) แบบ random — ป้องกัน identical plaintext → identical ciphertext
 * 2. เข้ารหัสด้วย AES-256-GCM
 * 3. ดึง Auth Tag (ใช้ตรวจสอบความสมบูรณ์ของข้อมูล)
 * 4. Return object ที่พร้อมเก็บลง MongoDB
 *
 * @param {Buffer|string} templateData - Fingerprint template (binary data หรือ base64 string)
 * @returns {{ encryptedData: string, iv: string, authTag: string }} - Encrypted components (hex strings)
 */
export function encryptTemplate(templateData) {
  const key = getEncryptionKey();

  // สร้าง IV ใหม่ทุกครั้ง — ห้ามใช้ IV ซ้ำกับ key เดียวกัน (critical for GCM security)
  const iv = crypto.randomBytes(IV_LENGTH);

  // แปลง input เป็น Buffer ถ้าจำเป็น
  const dataBuffer = Buffer.isBuffer(templateData)
    ? templateData
    : Buffer.from(templateData, "base64");

  // สร้าง cipher และเข้ารหัส
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(dataBuffer),
    cipher.final(),
  ]);

  // ดึง Authentication Tag (ใช้ verify ตอนถอดรหัส)
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * ถอดรหัส Fingerprint Template จาก AES-256-GCM
 *
 * ขั้นตอน:
 * 1. แปลง hex strings กลับเป็น Buffer
 * 2. สร้าง decipher พร้อม IV และ Auth Tag
 * 3. ถอดรหัสและตรวจสอบ integrity (ถ้า data ถูก tamper จะ throw error)
 *
 * @param {{ encryptedData: string, iv: string, authTag: string }} encryptedObj - Encrypted components
 * @returns {Buffer} - Decrypted fingerprint template (binary)
 * @throws {Error} - ถ้า data ถูก tamper หรือ key ผิด
 */
export function decryptTemplate(encryptedObj) {
  const key = getEncryptionKey();

  const { encryptedData, iv, authTag } = encryptedObj;

  // แปลง hex strings กลับเป็น Buffer
  const encryptedBuffer = Buffer.from(encryptedData, "hex");
  const ivBuffer = Buffer.from(iv, "hex");
  const authTagBuffer = Buffer.from(authTag, "hex");

  // สร้าง decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // ตั้ง Auth Tag — ถ้า data ถูก tamper จะ throw "Unsupported state or unable to authenticate data"
  decipher.setAuthTag(authTagBuffer);

  // ถอดรหัส
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(), // จุดนี้จะ verify integrity ด้วย
  ]);

  return decrypted;
}

/**
 * สร้าง Encryption Key ใหม่ (ใช้ตอน setup ครั้งแรก)
 *
 * @returns {string} - Random 32-byte key ในรูป hex string
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("hex");
}
