/**
 * Upload Middleware
 * จัดการการอัพโหลดไฟล์
 */

import multer from "multer";
import path from "path";
import fs from "fs";

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = "uploads/homework";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดที่เก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// กำหนดประเภทไฟล์ที่อนุญาต
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("ไฟล์ประเภทนี้ไม่อนุญาต"), false);
  }
};

// สร้าง multer instance
export const uploadHomework = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // จำกัด 10MB ต่อไฟล์
  },
});

export default uploadHomework;
