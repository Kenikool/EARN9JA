import { Router } from "express";
import { validationController } from "../controllers/validation.controller.js";

const router = Router();

/**
 * @route   POST /api/v1/validation/url
 * @desc    Validate URL format and platform
 * @access  Public
 */
router.post("/url", validationController.validateUrl);

/**
 * @route   POST /api/v1/validation/url/auto-correct
 * @desc    Auto-correct URL
 * @access  Public
 */
router.post("/url/auto-correct", validationController.autoCorrectUrl);

/**
 * @route   GET /api/v1/validation/suggestions/:platform
 * @desc    Get URL suggestions for a platform
 * @access  Public
 */
router.get("/suggestions/:platform", validationController.getSuggestions);

export default router;
