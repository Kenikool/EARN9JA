import { Router } from "express";
import { PreviewController } from "../controllers/preview.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Generate preview (requires auth)
router.post("/", authenticate, PreviewController.generatePreview);

// Get preview by ID (public - so it can be shared)
router.get("/:previewId", PreviewController.getPreview);

// Delete preview (requires auth)
router.delete("/:previewId", authenticate, PreviewController.deletePreview);

export default router;
