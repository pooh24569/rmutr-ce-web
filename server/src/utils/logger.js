import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const transports = [

  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  levels,
  transports,
  exitOnError: false,
});

export const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;