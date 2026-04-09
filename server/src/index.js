import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

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
import dashboardRoutes from "./routes/dashboardRoutes.js";
import homeworkRoutes from "./routes/homeworkRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRegistrationRoutes from "./routes/studentRegistrationRoutes.js";
import fingerprintRoutes from "./routes/fingerprintRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await dbConnect();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 500,
  skipSuccessfulRequests: true,
  message: "Too many authentication attempts, please try again later",
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many OTP requests, please try again later",
});

const checkInLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: Number(process.env.CHECKIN_RATE_LIMIT_MAX) || 10,
  message: "Too many check-in attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

app.use(sanitizeRequest);

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
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-admin", userAdminRouter);
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/classes", classRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student-registration", studentRegistrationRoutes);
app.use("/api/fingerprint", checkInLimiter, fingerprintRoutes);

app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, _next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate key error";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

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

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
});

const PORT = process.env.PORT || 7001;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`API Base: http://localhost:${PORT}`);
});

let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

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
      "Could not close connections in time, forcefully shutting down",
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
});

export default app;
