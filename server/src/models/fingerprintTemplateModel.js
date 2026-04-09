/**
 * ===================================================================
 * 🔐 Fingerprint Template Model
 * ===================================================================
 *
 * เก็บ Fingerprint Template ที่เข้ารหัสแล้ว (AES-256-GCM)
 *
 * โครงสร้างข้อมูล:
 * - student        → อ้างอิง User (นักศึกษา)
 * - encryptedData  → Template ที่เข้ารหัสแล้ว (hex string)
 * - iv             → Initialization Vector สำหรับ AES-GCM (hex string)
 * - authTag        → Authentication Tag สำหรับ verify integrity (hex string)
 * - fingerIndex    → นิ้วที่ลงทะเบียน (เช่น RIGHT_INDEX)
 * - quality        → คะแนนคุณภาพภาพลายนิ้วมือ (0-100)
 * - enrolledBy     → อาจารย์ที่ลงทะเบียนให้
 * - pdpaConsent    → บันทึก PDPA Consent (ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล)
 *
 * PDPA Compliance (มาตรา 26 — ข้อมูลอ่อนไหว):
 * - ต้องได้ Explicit Consent ก่อนเก็บ
 * - ต้องบันทึก timestamp ที่ให้ consent
 * - ต้องมี purpose ชัดเจน
 * - นักศึกษามีสิทธิ์ขอลบได้ (Right to Erasure)
 *
 * ===================================================================
 */

import mongoose from "mongoose";

const fingerprintTemplateSchema = new mongoose.Schema(
  {
    // ===== ข้อมูลอ้างอิง =====
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ต้องระบุนักศึกษา"],
    },

    // ===== ข้อมูลที่เข้ารหัส (AES-256-GCM) =====
    // Template ลายนิ้วมือที่เข้ารหัสแล้ว — ห้ามเก็บ plaintext เด็ดขาด
    encryptedData: {
      type: String,
      required: [true, "ต้องมีข้อมูล template ที่เข้ารหัส"],
    },

    // Initialization Vector — ใช้คู่กับ key ตอนถอดรหัส
    iv: {
      type: String,
      required: [true, "ต้องมี Initialization Vector (IV)"],
    },

    // Authentication Tag — ใช้ตรวจสอบ integrity (ป้องกัน tampering)
    authTag: {
      type: String,
      required: [true, "ต้องมี Authentication Tag"],
    },

    // ===== Metadata =====
    // นิ้วที่ลงทะเบียน
    fingerIndex: {
      type: String,
      enum: [
        "RIGHT_THUMB",
        "RIGHT_INDEX",
        "RIGHT_MIDDLE",
        "RIGHT_RING",
        "RIGHT_LITTLE",
        "LEFT_THUMB",
        "LEFT_INDEX",
        "LEFT_MIDDLE",
        "LEFT_RING",
        "LEFT_LITTLE",
      ],
      default: "RIGHT_INDEX",
    },

    // คะแนนคุณภาพภาพลายนิ้วมือ (จาก SourceAFIS)
    quality: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // อาจารย์ที่ลงทะเบียนให้
    enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ต้องระบุผู้ลงทะเบียน"],
    },

    // สถานะการใช้งาน (สามารถ soft-delete ได้)
    isActive: {
      type: Boolean,
      default: true,
    },

    // ===== PDPA Consent Record =====
    // ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 มาตรา 26
    pdpaConsent: {
      // นักศึกษาให้ความยินยอมหรือไม่
      given: {
        type: Boolean,
        required: [true, "ต้องระบุสถานะ PDPA Consent"],
        default: false,
      },

      // วันเวลาที่ให้ความยินยอม
      timestamp: {
        type: Date,
        required: [true, "ต้องระบุเวลาที่ให้ consent"],
        default: Date.now,
      },

      // วัตถุประสงค์ในการเก็บข้อมูล
      purpose: {
        type: String,
        default: "ใช้สำหรับยืนยันตัวตนในการเช็คชื่อเข้าเรียน",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ===== Indexes =====

// ค้นหา template ตาม student (ใช้ตอน identify)
// unique compound: นักศึกษา 1 คน ลงทะเบียนนิ้วเดียวกันได้แค่ครั้งเดียว
fingerprintTemplateSchema.index(
  { student: 1, fingerIndex: 1 },
  { unique: true },
);

// ค้นหาตาม isActive (filter เฉพาะ template ที่ใช้งานอยู่)
fingerprintTemplateSchema.index({ isActive: 1 });

// ค้นหาตาม enrolledBy (ดู template ที่อาจารย์คนนี้ลงทะเบียน)
fingerprintTemplateSchema.index({ enrolledBy: 1 });

// ===== Pre-save Validation =====

// ต้องมี consent ก่อนเก็บข้อมูลเสมอ (PDPA Enforcement)
fingerprintTemplateSchema.pre("save", function (next) {
  if (!this.pdpaConsent?.given) {
    const error = new Error(
      "ไม่สามารถบันทึกลายนิ้วมือได้ — นักศึกษายังไม่ให้ความยินยอม (PDPA Consent Required)",
    );
    error.statusCode = 403;
    return next(error);
  }
  return next();
});

const FingerprintTemplate =
  mongoose.models.FingerprintTemplate ||
  mongoose.model("FingerprintTemplate", fingerprintTemplateSchema);

export default FingerprintTemplate;
