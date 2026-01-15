import Joi from "joi";

const passwordSchema = Joi.string()
  .min(6)
  .max(128)
  .required()
  .messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  });

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

const emailSchema = Joi.string()
  .email({ minDomainSegments: 2 })
  .lowercase()
  .trim()
  .required()
  .messages({
    "string.email": "Please provide a valid email address",
  });

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

export const registerSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  firstName: Joi.string().min(1).max(100).trim().optional().allow(""),
  lastName: Joi.string().min(1).max(100).trim().optional().allow(""),
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
}).min(1);

export const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().optional(),
  lastName: Joi.string().min(2).max(50).trim().optional(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{9,13}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Phone number must be 9-13 digits",
    }),
  profileImage: Joi.string().optional().allow(""),
}).min(1);

export const updateStudentProfileSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9]{13}$/)
    .optional()
    .messages({
      "string.pattern.base": "Student ID must be exactly 13 digits",
    }),
  firstNameTH: Joi.string().min(2).max(100).trim().optional().allow(""),
  lastNameTH: Joi.string().min(2).max(100).trim().optional().allow(""),
  dateOfBirth: Joi.date().max("now").optional().allow(null),
  gender: Joi.string().valid("male", "female", "other", "").optional(),
  cardIssueDate: Joi.date().optional().allow(null),
  cardExpiryDate: Joi.date()
    .greater(Joi.ref("cardIssueDate"))
    .optional()
    .allow(null)
    .messages({
      "date.greater": "Card expiry date must be after issue date",
    }),
  address: Joi.object({
    street: Joi.string().max(200).trim().optional().allow(""),
    district: Joi.string().max(100).trim().optional().allow(""),
    province: Joi.string().max(100).trim().optional().allow(""),
    postalCode: Joi.string()
      .pattern(/^[0-9]{5}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Postal code must be 5 digits",
      }),
  }).optional(),
  education: Joi.object({
    faculty: Joi.string().max(200).trim().optional().allow(""),
    department: Joi.string().max(200).trim().optional().allow(""),
    year: Joi.number().integer().min(1).max(6).optional().allow(null),
    gpa: Joi.number().min(0).max(4.0).optional().allow(null).messages({
      "number.max": "GPA cannot exceed 4.0",
      "number.min": "GPA cannot be negative",
    }),
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().max(100).trim().optional().allow(""),
    relationship: Joi.string().max(50).trim().optional().allow(""),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{9,13}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Phone number must be 9-13 digits",
      }),
  }).optional(),
}).min(1);

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
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
  updateProfileSchema,
  updateStudentProfileSchema,
  validate,
};