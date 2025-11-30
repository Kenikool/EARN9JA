import Joi from "joi";

export const submitKYCSchema = Joi.object({
  verificationType: Joi.string()
    .valid("nin", "bvn", "drivers_license", "voters_card")
    .required(),
  identityNumber: Joi.string().required(),
  documents: Joi.object({
    idCard: Joi.string().uri().optional(),
    selfie: Joi.string().uri().optional(),
    proofOfAddress: Joi.string().uri().optional(),
  }).optional(),
  verificationData: Joi.object({
    fullName: Joi.string().optional(),
    dateOfBirth: Joi.string().optional(),
    address: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
  }).optional(),
});

export const rejectKYCSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required(),
});
