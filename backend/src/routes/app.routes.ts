import { Router } from "express";
import * as appVersionController from "../controllers/appVersion.controller.js";

const router = Router();

/**
 * @route   GET /api/v1/app/version
 * @desc    Get version info for platform (public)
 * @access  Public
 */
router.get("/version", appVersionController.getVersionInfo);

/**
 * @route   GET /api/v1/app/check-version
 * @desc    Check if update is required
 * @access  Public
 */
router.get("/check-version", appVersionController.checkVersion);

export default router;
