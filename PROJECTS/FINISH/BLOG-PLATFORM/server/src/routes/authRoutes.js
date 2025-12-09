import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  getUserById,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/users/:id", getUserById);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, validateUpdateProfile, updateProfile);

export default router;
