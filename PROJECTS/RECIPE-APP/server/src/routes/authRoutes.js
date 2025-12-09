import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login
);

router.get("/logout", logout);

router.get("/me", protect, getMe);

router.put(
  "/profile",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio cannot be more than 500 characters"),
  ],
  updateProfile
);

// User profile and social routes
router.get("/users/:userId", getUserProfile);
router.post("/users/:userId/follow", protect, followUser);
router.delete("/users/:userId/follow", protect, unfollowUser);
router.get("/users/:userId/followers", getFollowers);
router.get("/users/:userId/following", getFollowing);

export default router;
