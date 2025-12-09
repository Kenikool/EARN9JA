import express from "express";
import {
  handleClerkWebhook,
  linkClerkAccount,
  unlinkClerkAccount,
  getClerkStatus,
} from "../controllers/clerkController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Webhook route (no auth required, verified by Svix signature)
// Note: Raw body parser is handled in the controller
router.post("/webhook", handleClerkWebhook);

// Protected routes
router.post("/link", protect, linkClerkAccount);
router.post("/unlink", protect, unlinkClerkAccount);
router.get("/status", protect, getClerkStatus);

export default router;
