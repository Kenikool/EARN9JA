import express from "express";
import {
  getPrivacySettings,
  updatePrivacySettings,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/privacyController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/settings", getPrivacySettings);
router.put("/settings", updatePrivacySettings);
router.get("/notifications", getNotificationPreferences);
router.put("/notifications", updateNotificationPreferences);

export default router;
