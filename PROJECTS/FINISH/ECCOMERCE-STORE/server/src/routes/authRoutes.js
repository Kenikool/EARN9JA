import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
  updatePreferences,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  strictLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.put("/reset-password/:token", passwordResetLimiter, resetPassword);
router.post("/refresh-token", refreshToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", strictLimiter, resendVerificationEmail);

// Protected routes
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.put("/password", authenticate, strictLimiter, changePassword);
router.put("/preferences", authenticate, updatePreferences);

export default router;
