import Joi from "joi";

// Password validation rules (ผ่อนปรนกว่าเดิม)
const passwordSchema = Joi.string()
  .min(6) // ลดจาก 8 เป็น 6
  .max(128)
  .required()
  .messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  });

// Password validation แบบเข้มงวด (สำหรับ production)
const strongPasswordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password cannot exceed 128 characters",
  });

// Email validation
const emailSchema = Joi.string()
  .email({ minDomainSegments: 2 })
  .lowercase()
  .trim()
  .required()
  .messages({
    "string.email": "Please provide a valid email address",
  });

// Username validation
const usernameSchema = Joi.string()
  .alphanum()
  .min(3)
  .max(30)
  .trim()
  .required()
  .messages({
    "string.alphanum": "Username must only contain letters and numbers",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
  });

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema, // ใช้ password แบบธรรมดา (min 6 chars)
  role: Joi.string()
    .valid("student", "teacher", "parent", "admin", "superadmin")
    .optional()
    .default("student")
    .messages({
      "any.only":
        "Role must be one of: student, teacher, parent, admin, superadmin",
    }),
});

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const requestResetSchema = Joi.object({
  email: emailSchema,
});

export const confirmResetSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
      "any.required": "User ID is required",
    }),
  newPassword: passwordSchema.messages({
    "any.required": "New password is required",
  }),
});

export const sendOtpSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
      "any.required": "User ID is required",
    }),
});

export const verifyEmailSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "any.required": "OTP is required",
  }),
});

export const sendResetOtpSchema = Joi.object({
  email: emailSchema,
});

export const verifyResetOtpSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
  }),
});

export const resetPasswordSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: passwordSchema,
});

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: Joi.string()
    .valid("student", "teacher", "parent", "admin", "superadmin")
    .default("student"),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  role: Joi.string()
    .valid("student", "teacher", "parent", "admin", "superadmin")
    .optional(),
}).min(1); // At least one field must be provided

export const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),
});

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

export default {
  registerSchema,
  loginSchema,
  requestResetSchema,
  confirmResetSchema,
  sendOtpSchema,
  verifyEmailSchema,
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  validate,
};