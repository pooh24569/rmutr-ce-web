import { logger } from "../utils/logger.js";

const sanitizeValue = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const hasOperators = Object.keys(value).some((key) => key.startsWith("$"));
    if (hasOperators) {
      logger.warn("MongoDB injection attempt detected", { value });
      return {};
    }

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
    if (!key.startsWith("$")) {
      sanitized[key] = sanitizeValue(obj[key]);
    } else {
      logger.warn("Removed MongoDB operator from request", { key });
    }
  }
  return sanitized;
};

export const sanitizeRequest = (req, _res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }

    if (req.query && typeof req.query === "object") {
      const sanitizedQuery = sanitizeObject({ ...req.query });
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
