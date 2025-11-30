import Joi from "joi";

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().max(500).optional().allow(""),
  language: Joi.string().valid("en", "yo", "ig", "ha", "pcm").optional(),
  location: Joi.object({
    state: Joi.string().optional(),
    city: Joi.string().optional(),
  }).optional(),
});

export const updatePreferencesSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  taskAlerts: Joi.boolean().optional(),
  paymentAlerts: Joi.boolean().optional(),
  marketingEmails: Joi.boolean().optional(),
});
