import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import dbConnect from "./config/dbConnect.js";
import { logger } from "./utils/logger.js";
import sanitizeRequest from "./middlewares/sanitize.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userAdminRouter from "./routes/userAdminRouter.js";
import eventRoutes from "./routes/eventRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

// Connect to database
await dbConnect();

const app = express();

// ============================================
// SECURITY MIDDLEWARES
// ============================================

// Helmet: Set security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// Rate Limiters - เพิ่มสำหรับ Development
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // ลดเหลือ 1 นาที
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 2000, // เพิ่มเป็น 2000
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 50, // เพิ่มจาก 5 เป็น 50 สำหรับ dev
  skipSuccessfulRequests: true,
  message: "Too many authentication attempts, please try again later",
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // เพิ่มจาก 3 เป็น 10 สำหรับ dev
  message: "Too many OTP requests, please try again later",
});

// ✅ SECURITY FIX: Add rate limiter for check-in to prevent brute-force
const checkInLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: Number(process.env.CHECKIN_RATE_LIMIT_MAX) || 10, // 10 attempts per minute
  message: "Too many check-in attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// GENERAL MIDDLEWARES
// ============================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// ⚠️ IMPORTANT: Manual sanitization (Express 5 compatible)
// Must be AFTER body parser but BEFORE routes
app.use(sanitizeRequest);

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://yourdomain.com",
  "https://www.yourdomain.com",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// ============================================
// HEALTH CHECK & INFO ENDPOINTS
// ============================================

app.get("/", (_req, res) => {
  res.json({
    message: "API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", async (_req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: "OK",
    environment: process.env.NODE_ENV,
    database: "checking...",
  };

  try {
    await mongoose.connection.db.admin().ping();
    health.database = "connected";
    res.status(200).json(health);
  } catch (error) {
    health.database = "disconnected";
    health.status = "ERROR";
    logger.error("Health check failed", { error: error.message });
    res.status(503).json(health);
  }
});

// ============================================
// APPLY RATE LIMITERS TO ROUTES
// ============================================

app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/send-verify-otp", otpLimiter);
app.use("/api/auth/send-reset-otp", otpLimiter);
// ✅ SECURITY FIX: Apply rate limiter to check-in endpoint
app.use("/api/attendance/check-in", checkInLimiter);
app.use("/api/sessions/:sessionId/check-in", checkInLimiter);

// ============================================
// ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-admin", userAdminRouter);
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/classes", classRoutes);
app.use("/api", attendanceRoutes); // Session & Attendance
app.use("/api/registration", registrationRoutes); // Mock Registration Data
app.use("/api/enrollments", enrollmentRoutes); // Student Enrollment

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ✅ Global Error Handler (ปรับปรุงแล้ว)
app.use((err, req, res, _next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate key error";
  }

  // Mongoose Cast Error
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please log in again.";
  }

  const response = {
    success: false,
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 7001;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`🔗 API Base: http://localhost:${PORT}`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed");

    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  gracefulShutdown("unhandledRejection");
});

export default app;
