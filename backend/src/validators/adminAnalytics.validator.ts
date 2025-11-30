import Joi from "joi";

export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  platform: Joi.string().valid("ios", "android", "all").optional(),
  groupBy: Joi.string().valid("day", "week", "month").optional().default("day"),
}).custom((value, helpers) => {
  if (value.startDate && value.endDate) {
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    if (start > end) {
      return helpers.error("any.invalid", {
        message: "startDate must be before endDate",
      });
    }
  }
  return value;
});
