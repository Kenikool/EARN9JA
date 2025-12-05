import { Router } from "express";
import { RequirementController } from "../controllers/requirement.controller";

const router = Router();

// Get requirement suggestions (public)
router.get("/suggestions", RequirementController.getSuggestions);

// Get categories (public)
router.get("/categories", RequirementController.getCategories);

// Get platforms for category (public)
router.get("/platforms/:category", RequirementController.getPlatforms);

// Get requirement by ID (public)
router.get("/:id", RequirementController.getRequirementById);

// Calculate difficulty (public)
router.post("/difficulty", RequirementController.calculateDifficulty);

// Suggest more requirements (public)
router.post("/suggest-more", RequirementController.suggestMore);

export default router;
