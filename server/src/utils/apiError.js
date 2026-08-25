

export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const createError = (statusCode, message) => {
  return new ApiError(statusCode, message);
};

export const notFoundError = (resource = "Resource") => {
  return new ApiError(404, `${resource} not found`);
};

export const unauthorizedError = (message = "Unauthorized") => {
  return new ApiError(401, message);
};

export const forbiddenError = (message = "Forbidden") => {
  return new ApiError(403, message);
};

export const validationError = (message = "Validation failed") => {
  return new ApiError(400, message);
};

export const conflictError = (message = "Resource already exists") => {
  return new ApiError(409, message);
};
