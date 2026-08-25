/**
 * ===================================================================
 * 🔐 Fingerprint Controller
 * ===================================================================
 *
 * จัดการ Logic ทั้งหมดเกี่ยวกับลายนิ้วมือ:
 * 1. enrollFingerprint    — ลงทะเบียนลายนิ้วมือนักศึกษา
 * 2. identifyAndCheckIn   — ระบุตัวตน + เช็คชื่ออัตโนมัติ
 * 3. verifyStudent        — ยืนยัน 1:1 (เทียบกับนักศึกษาคนเฉพาะ)
 * 4. getEnrollmentStatus  — ตรวจสอบสถานะว่าลงทะเบียนลายนิ้วมือแล้วหรือยัง
 * 5. deleteFingerprint    — ลบลายนิ้วมือ (PDPA Right to Erasure)
 *
 * Flow:
 * [React] → image (base64) → [Express] → [SourceAFIS Docker :8090] → template
 *                                       → [MongoDB] เก็บ template (encrypted)
 *
 * ===================================================================
 */

import FingerprintTemplate from "../models/fingerprintTemplateModel.js";
import Attendance from "../models/attendanceModel.js";
import Session from "../models/sessionModel.js";
import { encryptTemplate, decryptTemplate } from "../utils/encryptionUtil.js";
import { logger } from "../utils/logger.js";

// --- Configuration ---
const SOURCEAFIS_URL =
  process.env.SOURCEAFIS_URL || "http://localhost:8090/api";
const MATCH_THRESHOLD = Number(process.env.FINGERPRINT_MATCH_THRESHOLD) || 40;

/**
 * ===================================================================
 * 1. ลงทะเบียนลายนิ้วมือ (Enrollment)
 * ===================================================================
 *
 * ขั้นตอน:
 * 1. รับ image base64 จาก React (ที่ได้จาก Python Agent)
 * 2. ส่งไปยัง SourceAFIS Docker เพื่อ extract template
 * 3. เข้ารหัส template ด้วย AES-256-GCM
 * 4. เก็บลง MongoDB พร้อม PDPA consent record
 *
 * Security:
 * - ต้อง login เป็น instructor เท่านั้น
 * - ต้องมี PDPA consent = true
 * - Template เก็บแบบเข้ารหัสเท่านั้น
 */
export const enrollFingerprint = async (req, res) => {
  try {
    const {
      studentId,
      imageBase64,
      fingerIndex = "RIGHT_INDEX",
      pdpaConsent = false,
    } = req.body;

    // --- Validation ---
    if (!studentId || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ studentId และ imageBase64",
      });
    }

    // ตรวจสอบ PDPA Consent (บังคับตามกฎหมาย)
    if (!pdpaConsent) {
      return res.status(403).json({
        success: false,
        message:
          "ไม่สามารถลงทะเบียนได้ — ต้องได้รับความยินยอม PDPA จากนักศึกษาก่อน",
        code: "PDPA_CONSENT_REQUIRED",
      });
    }

    // ตรวจสอบว่าลงทะเบียนนิ้วนี้แล้วหรือยัง
    const existing = await FingerprintTemplate.findOne({
      student: studentId,
      fingerIndex,
      isActive: true,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `นักศึกษาลงทะเบียนนิ้ว ${fingerIndex} แล้ว`,
        code: "ALREADY_ENROLLED",
      });
    }

    // --- ส่ง image ไปยัง SourceAFIS เพื่อ extract template ---
    let templateData;
    try {
      const response = await fetch(`${SOURCEAFIS_URL}/extract-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error("SourceAFIS extract error", { status: response.status, body: errorBody });
        return res.status(502).json({
          success: false,
          message: "ไม่สามารถ extract ลายนิ้วมือได้ — SourceAFIS service error",
        });
      }

      const result = await response.json();
      templateData = result.template; // base64 encoded template
    } catch (fetchError) {
      logger.error("Cannot connect to SourceAFIS", { error: fetchError.message });
      return res.status(503).json({
        success: false,
        message: "ไม่สามารถเชื่อมต่อ SourceAFIS service ได้ — กรุณาตรวจสอบว่า service กำลังทำงาน",
        hint: "รัน: docker-compose up fingerprint-matcher",
      });
    }

    // --- เข้ารหัส Template ด้วย AES-256-GCM ---
    const encrypted = encryptTemplate(templateData);

    // --- บันทึกลง MongoDB ---
    const fingerprintRecord = new FingerprintTemplate({
      student: studentId,
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      fingerIndex,
      enrolledBy: req.user.id,
      pdpaConsent: {
        given: true,
        timestamp: new Date(),
        purpose: "ใช้สำหรับยืนยันตัวตนในการเช็คชื่อเข้าเรียน",
      },
    });

    await fingerprintRecord.save();

    logger.info("Fingerprint enrolled", {
      studentId,
      fingerIndex,
      enrolledBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "ลงทะเบียนลายนิ้วมือสำเร็จ",
      data: {
        id: fingerprintRecord._id,
        student: studentId,
        fingerIndex,
        enrolledAt: fingerprintRecord.createdAt,
      },
    });
  } catch (error) {
    logger.error("Error enrolling fingerprint", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลงทะเบียนลายนิ้วมือ",
    });
  }
};

/**
 * ===================================================================
 * 2. ระบุตัวตน + เช็คชื่ออัตโนมัติ (Identify & Check-in)
 * ===================================================================
 *
 * ขั้นตอน:
 * 1. รับ image base64 + sessionId จาก React
 * 2. ดึง template ทั้งหมดของนักศึกษาใน session นี้
 * 3. ถอดรหัส template ทั้งหมด
 * 4. ส่งไปยัง SourceAFIS เพื่อ match 1:N
 * 5. ถ้า match → เช็คชื่ออัตโนมัติ (reuse logic จาก attendanceController)
 *
 * Performance: สำหรับ class < 100 คน ใช้ brute-force 1:N ได้เลย
 */
export const identifyAndCheckIn = async (req, res) => {
  try {
    const { sessionId, imageBase64 } = req.body;

    // --- Validation ---
    if (!sessionId || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ sessionId และ imageBase64",
      });
    }

    // --- ตรวจสอบ Session ---
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session",
      });
    }

    if (session.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Session ปิดแล้ว ไม่สามารถเช็คชื่อได้",
      });
    }

    // --- ดึงรายชื่อนักศึกษาใน session นี้ ---
    const attendances = await Attendance.find({ sessionId }).select("student");
    const studentIds = attendances.map((a) => a.student);

    // --- ดึง template ที่ลงทะเบียนแล้ว (เฉพาะนักศึกษาใน session) ---
    const templates = await FingerprintTemplate.find({
      student: { $in: studentIds },
      isActive: true,
    });

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบลายนิ้วมือที่ลงทะเบียนใน session นี้",
        enrolledCount: 0,
        totalStudents: studentIds.length,
      });
    }

    // --- ถอดรหัส template ทั้งหมด ---
    const candidates = templates.map((t) => {
      const decrypted = decryptTemplate({
        encryptedData: t.encryptedData,
        iv: t.iv,
        authTag: t.authTag,
      });

      return {
        studentId: t.student.toString(),
        template: decrypted.toString("base64"),
      };
    });

    // --- ส่งไปยัง SourceAFIS เพื่อ match 1:N ---
    let matchResult;
    try {
      const response = await fetch(`${SOURCEAFIS_URL}/match-1toN`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          probeImage: imageBase64,
          candidates,
          threshold: MATCH_THRESHOLD,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error("SourceAFIS match error", { status: response.status, body: errorBody });
        return res.status(502).json({
          success: false,
          message: "SourceAFIS matching error",
        });
      }

      matchResult = await response.json();
    } catch (fetchError) {
      logger.error("Cannot connect to SourceAFIS", { error: fetchError.message });
      return res.status(503).json({
        success: false,
        message: "ไม่สามารถเชื่อมต่อ SourceAFIS service ได้",
      });
    }

    // --- ตรวจสอบผลลัพธ์ ---
    if (!matchResult.matched) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบลายนิ้วมือที่ตรงกัน — กรุณาลองใหม่",
        score: matchResult.score || 0,
        threshold: MATCH_THRESHOLD,
      });
    }

    // --- Match สำเร็จ → เช็คชื่ออัตโนมัติ ---
    const matchedStudentId = matchResult.matchedStudentId;

    const attendance = await Attendance.findOne({
      sessionId,
      student: matchedStudentId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบนักศึกษาใน Session นี้",
      });
    }

    // ตรวจสอบว่าเช็คชื่อแล้วหรือยัง
    if (attendance.checkInTime) {
      await attendance.populate("student", "username firstName lastName");
      return res.status(400).json({
        success: false,
        message: "เช็คชื่อแล้ว",
        data: {
          student: attendance.student,
          checkInTime: attendance.checkInTime,
          status: attendance.status,
        },
      });
    }

    // --- คำนวณสถานะ (มา/สาย) ---
    const now = new Date();
    const checkInTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let status = "PRESENT";
    if (checkInTimeStr > session.lateTime) {
      status = "LATE";
    }

    // --- อัปเดต Attendance ---
    attendance.checkInTime = now;
    attendance.status = status;
    attendance.method = "FINGERPRINT";
    attendance.deviceId = "U.are.U 4500";
    await attendance.save();

    // --- อัปเดต Session summary ---
    if (status === "PRESENT") {
      session.summary.present += 1;
    } else if (status === "LATE") {
      session.summary.late += 1;
    }
    session.summary.absent = Math.max(0, session.summary.absent - 1);
    await session.save();

    // --- Populate student info สำหรับ response ---
    await attendance.populate("student", "username firstName lastName");

    logger.info("Fingerprint check-in success", {
      studentId: matchedStudentId,
      sessionId,
      status,
      score: matchResult.score,
    });

    return res.status(200).json({
      success: true,
      message: status === "PRESENT" ? "เช็คชื่อสำเร็จ ✅" : "เช็คชื่อสำเร็จ (สาย) ⚠️",
      data: {
        student: attendance.student,
        status,
        checkInTime: checkInTimeStr,
        matchScore: matchResult.score,
        method: "FINGERPRINT",
      },
    });
  } catch (error) {
    logger.error("Error identify & check-in", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเช็คชื่อด้วยลายนิ้วมือ",
    });
  }
};

/**
 * ===================================================================
 * 3. ยืนยัน 1:1 (Verify)
 * ===================================================================
 *
 * ใช้เมื่อต้องการเทียบลายนิ้วมือกับนักศึกษาคนเฉพาะ
 */
export const verifyStudent = async (req, res) => {
  try {
    const { studentId, imageBase64 } = req.body;

    if (!studentId || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ studentId และ imageBase64",
      });
    }

    // ดึง template ของนักศึกษาคนนี้
    const template = await FingerprintTemplate.findOne({
      student: studentId,
      isActive: true,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "นักศึกษายังไม่ได้ลงทะเบียนลายนิ้วมือ",
      });
    }

    // ถอดรหัส template
    const decrypted = decryptTemplate({
      encryptedData: template.encryptedData,
      iv: template.iv,
      authTag: template.authTag,
    });

    // ส่งไปยัง SourceAFIS เพื่อ match 1:1
    const response = await fetch(`${SOURCEAFIS_URL}/match-1to1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        probeImage: imageBase64,
        candidateTemplate: decrypted.toString("base64"),
        threshold: MATCH_THRESHOLD,
      }),
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "SourceAFIS service error",
      });
    }

    const result = await response.json();

    return res.status(200).json({
      success: true,
      matched: result.matched,
      score: result.score,
      threshold: MATCH_THRESHOLD,
      message: result.matched ? "ยืนยันตัวตนสำเร็จ ✅" : "ลายนิ้วมือไม่ตรง ❌",
    });
  } catch (error) {
    logger.error("Error verify student", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * ===================================================================
 * 4. ตรวจสอบสถานะลงทะเบียน (Enrollment Status)
 * ===================================================================
 *
 * ใช้ตรวจสอบว่านักศึกษาลงทะเบียนลายนิ้วมือแล้วหรือยัง
 * + ดูจำนวนนิ้วที่ลงทะเบียนแล้ว
 */
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    const templates = await FingerprintTemplate.find({
      student: studentId,
      isActive: true,
    }).select("fingerIndex quality createdAt");

    return res.status(200).json({
      success: true,
      data: {
        enrolled: templates.length > 0,
        count: templates.length,
        fingers: templates.map((t) => ({
          fingerIndex: t.fingerIndex,
          quality: t.quality,
          enrolledAt: t.createdAt,
        })),
      },
    });
  } catch (error) {
    logger.error("Error getting enrollment status", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * ===================================================================
 * 5. ตรวจสอบสถานะ Enrollment รายกลุ่มเรียน
 * ===================================================================
 *
 * ดูว่านักศึกษาใน courseOffering ลงทะเบียนลายนิ้วมือแล้วกี่คน
 */
export const getBulkEnrollmentStatus = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ studentIds เป็น array",
      });
    }

    const templates = await FingerprintTemplate.find({
      student: { $in: studentIds },
      isActive: true,
    }).select("student fingerIndex");

    // สร้าง map: studentId → enrolled fingers
    const enrollmentMap = {};
    templates.forEach((t) => {
      const sid = t.student.toString();
      if (!enrollmentMap[sid]) {
        enrollmentMap[sid] = [];
      }
      enrollmentMap[sid].push(t.fingerIndex);
    });

    const result = studentIds.map((id) => ({
      studentId: id,
      enrolled: !!enrollmentMap[id],
      fingers: enrollmentMap[id] || [],
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: studentIds.length,
        enrolledCount: Object.keys(enrollmentMap).length,
        notEnrolledCount: studentIds.length - Object.keys(enrollmentMap).length,
        students: result,
      },
    });
  } catch (error) {
    logger.error("Error getting bulk enrollment status", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * ===================================================================
 * 6. ลบลายนิ้วมือ (PDPA Right to Erasure)
 * ===================================================================
 *
 * ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล มาตรา 33(5)
 * เจ้าของข้อมูลมีสิทธิ์ขอให้ลบข้อมูลส่วนบุคคลได้
 *
 * ใช้ Soft Delete (isActive = false) เพื่อเก็บ audit trail
 * แต่ลบ encrypted data ออกจริง เพื่อไม่ให้ reconstruct ได้
 */
export const deleteFingerprint = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fingerIndex } = req.query;

    const query = { student: studentId, isActive: true };
    if (fingerIndex) {
      query.fingerIndex = fingerIndex;
    }

    const templates = await FingerprintTemplate.find(query);

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบลายนิ้วมือที่ลงทะเบียน",
      });
    }

    // Soft delete + ลบ encrypted data จริง
    for (const template of templates) {
      template.isActive = false;
      template.encryptedData = ""; // ลบข้อมูลเข้ารหัสออกจริง
      template.iv = "";
      template.authTag = "";
      await template.save({ validateBeforeSave: false });
    }

    logger.info("Fingerprint deleted (PDPA erasure)", {
      studentId,
      fingerIndex: fingerIndex || "ALL",
      deletedBy: req.user.id,
      count: templates.length,
    });

    return res.status(200).json({
      success: true,
      message: `ลบลายนิ้วมือสำเร็จ (${templates.length} รายการ)`,
      data: {
        deletedCount: templates.length,
        studentId,
      },
    });
  } catch (error) {
    logger.error("Error deleting fingerprint", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบลายนิ้วมือ",
    });
  }
};
