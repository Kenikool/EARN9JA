import Joi from "joi";

export const adWatchSchema = Joi.object({
  taskId: Joi.string().optional().default("admob_reward"),
  platform: Joi.string().valid("ios", "android").required().messages({
    "any.required": "Platform is required",
    "any.only": "Platform must be either ios or android",
  }),
  deviceId: Joi.string().required().messages({
    "any.required": "Device ID is required",
  }),
  timestamp: Joi.string().isoDate().optional(),
  metadata: Joi.object({
    adUnitId: Joi.string().optional(),
    adNetwork: Joi.string().optional(),
    adType: Joi.string().optional(),
    sessionId: Joi.string().optional(),
  }).optional(),
});
