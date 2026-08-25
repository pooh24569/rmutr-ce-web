import Joi from "joi";

const passwordSchema = Joi.string().min(6).max(128).required().messages({
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
    .valid(
      "superadmin",
      "admin",
      "central_registrar",
      "faculty_registrar",
      "dept_head",
      "instructor",
      "student",
      "parent",
    )
    .optional()
    .default("student")
    .messages({
      "any.only":
        "Role must be one of: superadmin, admin, central_registrar, faculty_registrar, dept_head, instructor, student, parent",
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

export const parentLoginSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "any.required": "กรุณากรอกชื่อผู้ปกครอง",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "กรุณากรอกนามสกุลผู้ปกครอง",
  }),
  studentId: Joi.string().pattern(/^[0-9]{13}$/).required().messages({
    "string.pattern.base": "เลขนักศึกษาต้องเป็นตัวเลข 13 หลัก",
    "any.required": "กรุณากรอกเลขนักศึกษา",
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
    .valid(
      "superadmin",
      "admin",
      "central_registrar",
      "faculty_registrar",
      "dept_head",
      "instructor",
      "student",
      "parent",
    )
    .default("student"),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  role: Joi.string()
    .valid(
      "superadmin",
      "admin",
      "central_registrar",
      "faculty_registrar",
      "dept_head",
      "instructor",
      "student",
      "parent",
    )
    .optional(),
}).min(1);

export const adminResetPasswordSchema = Joi.object({
  newPassword: passwordSchema,
});

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
  // Personal Information
  studentId: Joi.string()
    .pattern(/^[0-9]{13}$/)
    .optional()
    .messages({
      "string.pattern.base": "Student ID must be exactly 13 digits",
    }),
  nationality: Joi.string().max(100).trim().optional().allow(""),
  nationalId: Joi.string().max(20).trim().optional().allow(""),
  cardIssueDate: Joi.date().optional().allow(null),
  cardExpiryDate: Joi.date().optional().allow(null),
  prefix: Joi.string().max(20).trim().optional().allow(""),
  firstNameTH: Joi.string().max(100).trim().optional().allow(""),
  lastNameTH: Joi.string().max(100).trim().optional().allow(""),
  firstNameEN: Joi.string().max(100).trim().optional().allow(""),
  lastNameEN: Joi.string().max(100).trim().optional().allow(""),
  dateOfBirth: Joi.date().max("now").optional().allow(null),
  birthProvince: Joi.string().max(100).trim().optional().allow(""),
  ethnicity: Joi.string().max(100).trim().optional().allow(""),
  religion: Joi.string().max(100).trim().optional().allow(""),
  bloodType: Joi.string().valid("A", "B", "AB", "O", "").optional(),
  maritalStatus: Joi.string().max(50).trim().optional().allow(""),
  talents: Joi.string().max(500).trim().optional().allow(""),
  sports: Joi.string().max(500).trim().optional().allow(""),
  height: Joi.number().min(0).max(300).optional().allow(null),
  weight: Joi.number().min(0).max(500).optional().allow(null),
  gender: Joi.string().valid("male", "female", "other", "").optional(),

  // Previous Education
  previousEducation: Joi.object({
    schoolName: Joi.string().max(200).trim().optional().allow(""),
    qualification: Joi.string().max(100).trim().optional().allow(""),
    graduationDate: Joi.date().optional().allow(null),
    gpa: Joi.number().min(0).max(4.0).optional().allow(null),
  }).optional(),

  // Address
  address: Joi.object({
    houseCode: Joi.string().max(50).trim().optional().allow(""),
    village: Joi.string().max(100).trim().optional().allow(""),
    houseNumber: Joi.string().max(50).trim().optional().allow(""),
    moo: Joi.string().max(20).trim().optional().allow(""),
    soi: Joi.string().max(100).trim().optional().allow(""),
    road: Joi.string().max(100).trim().optional().allow(""),
    province: Joi.string().max(100).trim().optional().allow(""),
    district: Joi.string().max(100).trim().optional().allow(""),
    subDistrict: Joi.string().max(100).trim().optional().allow(""),
    postalCode: Joi.string()
      .pattern(/^[0-9]{5}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Postal code must be 5 digits",
      }),
    homePhone: Joi.string().max(20).trim().optional().allow(""),
    mobilePhone: Joi.string().max(20).trim().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
  }).optional(),

  // Father Information
  father: Joi.object({
    nationality: Joi.string().max(100).trim().optional().allow(""),
    nationalId: Joi.string().max(20).trim().optional().allow(""),
    prefix: Joi.string().max(20).trim().optional().allow(""),
    firstName: Joi.string().max(100).trim().optional().allow(""),
    lastName: Joi.string().max(100).trim().optional().allow(""),
    status: Joi.string().max(50).trim().optional().allow(""),
    education: Joi.string().max(100).trim().optional().allow(""),
    dateOfBirth: Joi.date().optional().allow(null),
  }).optional(),

  // Mother Information
  mother: Joi.object({
    nationality: Joi.string().max(100).trim().optional().allow(""),
    nationalId: Joi.string().max(20).trim().optional().allow(""),
    prefix: Joi.string().max(20).trim().optional().allow(""),
    firstName: Joi.string().max(100).trim().optional().allow(""),
    lastName: Joi.string().max(100).trim().optional().allow(""),
    status: Joi.string().max(50).trim().optional().allow(""),
    education: Joi.string().max(100).trim().optional().allow(""),
    dateOfBirth: Joi.date().optional().allow(null),
  }).optional(),

  // Guardian Information
  guardian: Joi.object({
    nationality: Joi.string().max(100).trim().optional().allow(""),
    nationalId: Joi.string().max(20).trim().optional().allow(""),
    prefix: Joi.string().max(20).trim().optional().allow(""),
    firstName: Joi.string().max(100).trim().optional().allow(""),
    lastName: Joi.string().max(100).trim().optional().allow(""),
    relationship: Joi.string().max(50).trim().optional().allow(""),
    dateOfBirth: Joi.date().optional().allow(null),
  }).optional(),

  // Emergency Contact
  emergencyContact: Joi.object({
    prefix: Joi.string().max(20).trim().optional().allow(""),
    firstName: Joi.string().max(100).trim().optional().allow(""),
    lastName: Joi.string().max(100).trim().optional().allow(""),
  }).optional(),

  // Current Education
  education: Joi.object({
    faculty: Joi.string().max(200).trim().optional().allow(""),
    department: Joi.string().max(200).trim().optional().allow(""),
    year: Joi.number().integer().min(1).max(6).optional().allow(null),
    gpa: Joi.number().min(0).max(4.0).optional().allow(null).messages({
      "number.max": "GPA cannot exceed 4.0",
      "number.min": "GPA cannot be negative",
    }),
  }).optional(),
});

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
  parentLoginSchema,
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
  adminResetPasswordSchema,
  updateProfileSchema,
  updateStudentProfileSchema,
  validate,
};
