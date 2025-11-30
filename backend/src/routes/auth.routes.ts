import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  registerSchema,
  sendOTPSchema,
  verifyOTPSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register/send-otp",
  validateRequest(sendOTPSchema),
  authController.sendOTP
);

router.post(
  "/register/verify",
  validateRequest(verifyOTPSchema),
  authController.verifyOTP
);

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

router.post("/login", validateRequest(loginSchema), authController.login);

router.post("/logout", authController.logout);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  "/forgot-password/send-otp",
  validateRequest(sendOTPSchema),
  authController.sendOTP
);

router.post(
  "/forgot-password/reset",
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

router.post(
  "/resend-otp",
  validateRequest(sendOTPSchema),
  authController.resendOTP
);

export default router;
