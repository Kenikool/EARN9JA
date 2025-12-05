import { Router } from "express";
import { DraftController } from "../controllers/draft.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Save or update draft
router.post("/", DraftController.saveDraft);

// Get user's draft
router.get("/", DraftController.getDraft);

// Delete user's draft
router.delete("/", DraftController.deleteDraft);

// Cleanup expired drafts (should be called by cron job)
// TODO: Add admin middleware for production
router.post("/cleanup", DraftController.cleanupExpiredDrafts);

export default router;
