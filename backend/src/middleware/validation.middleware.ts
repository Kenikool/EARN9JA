import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { z } from "zod";

type ValidationSchema = Joi.ObjectSchema | z.ZodTypeAny;

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if it's a Zod schema
      if ("safeParse" in schema) {
        // Zod validation
        console.log("🔍 Validating with Zod:");
        console.log("  Body:", JSON.stringify(req.body, null, 2));
        console.log("  Query:", JSON.stringify(req.query, null, 2));
        console.log("  Params:", JSON.stringify(req.params, null, 2));

        const result = schema.safeParse({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        if (!result.success) {
          const errors = result.error.issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          console.log(
            "❌ Zod validation failed:",
            JSON.stringify(errors, null, 2)
          );

          res.status(400).json({
            success: false,
            error: "Validation failed",
            details: errors,
          });
          return;
        }

        console.log("✅ Zod validation passed");
        // Update request with validated data
        const data = result.data as any;
        if (data.body) req.body = data.body;
        if (data.query) req.query = data.query;
        if (data.params) req.params = data.params;
        next();
      } else {
        // Joi validation (legacy support)
        const dataToValidate = req.body;
        console.log(
          `🔍 Validating body:`,
          JSON.stringify(dataToValidate, null, 2)
        );

        const { error, value } = schema.validate(dataToValidate, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          }));

          console.log(
            "❌ Joi validation failed:",
            JSON.stringify(errors, null, 2)
          );

          res.status(400).json({
            success: false,
            error: "Validation failed",
            details: errors,
          });
          return;
        }

        console.log("✅ Joi validation passed");
        req.body = value;
        next();
      }
    } catch (error) {
      console.error("❌ Validation middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Internal validation error",
      });
    }
  };
};

// Express-validator middleware
import { validationResult } from "express-validator";

export const validationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? (err as any).path : "unknown",
        message: err.msg,
      })),
    });
    return;
  }

  next();
};
