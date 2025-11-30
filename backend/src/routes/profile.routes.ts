import { Router } from "express";
import { profileController } from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  updateProfileSchema,
  updatePreferencesSchema,
} from "../validators/profile.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", profileController.getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  validateRequest(updateProfileSchema),
  profileController.updateProfile
);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload profile avatar
 * @access  Private
 */
router.post("/avatar", profileController.uploadAvatar);

/**
 * @route   PUT /api/v1/users/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put(
  "/preferences",
  validateRequest(updatePreferencesSchema),
  profileController.updatePreferences
);

/**
 * @route   GET /api/v1/users/profile/notification-settings
 * @desc    Get notification settings
 * @access  Private
 */
router.get(
  "/profile/notification-settings",
  profileController.getNotificationSettings
);

/**
 * @route   PUT /api/v1/users/profile/notification-settings
 * @desc    Update notification settings
 * @access  Private
 */
router.put(
  "/profile/notification-settings",
  profileController.updateNotificationSettings
);

export default router;
