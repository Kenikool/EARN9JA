import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^(\+?[1-9]\d{1,14}|0\d{10})$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be in international format (+2349012345678) or local format (09012345678)",
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    }),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  roles: Joi.array()
    .items(Joi.string().valid("service_worker", "sponsor", "admin"))
    .min(1)
    .required(),
  // Sponsor-specific fields (optional, allow empty strings)
  companyName: Joi.string().allow("").optional(),
  businessType: Joi.string().allow("").optional(),
  taxId: Joi.string().allow("").optional(),
  businessDescription: Joi.string().allow("").optional(),
});

export const sendOTPSchema = Joi.object({
  identifier: Joi.string().required(),
  type: Joi.string().valid("email", "phone").required(),
  purpose: Joi.string()
    .valid("registration", "login", "password_reset", "withdrawal")
    .required(),
});

export const verifyOTPSchema = Joi.object({
  identifier: Joi.string().required(),
  code: Joi.string().length(6).required(),
  purpose: Joi.string()
    .valid("registration", "login", "password_reset", "withdrawal")
    .required(),
});

export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object({
  identifier: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required(),
});
