import { Router } from "express";
import { TemplateController } from "../controllers/template.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Get popular templates (public)
router.get("/popular", TemplateController.getPopularTemplates);

// Get all templates with filtering (public)
router.get("/", TemplateController.getTemplates);

// Get template by ID (public)
router.get("/:id", TemplateController.getTemplateById);

// Apply template with variables (requires auth)
router.post("/:id/apply", authenticate, TemplateController.applyTemplate);

// Create template (requires auth)
router.post("/", authenticate, TemplateController.createTemplate);

// Update template (requires auth)
router.put("/:id", authenticate, TemplateController.updateTemplate);

// Delete template (requires auth)
router.delete("/:id", authenticate, TemplateController.deleteTemplate);

export default router;
