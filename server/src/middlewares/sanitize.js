import { logger } from "../utils/logger.js";

/**
 * Manual MongoDB injection sanitization middleware
 * Compatible with Express 5
 */

const sanitizeValue = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    // Check if object contains MongoDB operators
    const hasOperators = Object.keys(value).some((key) => key.startsWith("$"));
    if (hasOperators) {
      logger.warn("MongoDB injection attempt detected", { value });
      return {}; // Return empty object instead of malicious one
    }

    // Recursively sanitize nested objects
    const sanitized = {};
    for (const key of Object.keys(value)) {
      if (!key.startsWith("$")) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  return value;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Remove keys that start with $ (MongoDB operators)
    if (!key.startsWith("$")) {
      sanitized[key] = sanitizeValue(obj[key]);
    } else {
      logger.warn("Removed MongoDB operator from request", { key });
    }
  }
  return sanitized;
};

/**
 * Middleware to sanitize request data
 */
export const sanitizeRequest = (req, _res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize params
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }

    // Sanitize query - Create new object to avoid read-only issues
    if (req.query && typeof req.query === "object") {
      const sanitizedQuery = sanitizeObject({ ...req.query });
      // Override the getter with defineProperty
      Object.defineProperty(req, "query", {
        value: sanitizedQuery,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  } catch (error) {
    logger.error("Sanitization error", { error: error.message });
    next(error);
  }
};

export default sanitizeRequest;