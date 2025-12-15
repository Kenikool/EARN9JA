import { Router } from "express";
import {
  logFrontendEvent,
  logFrontendBatch,
} from "../controllers/logging.controller.js";

const router = Router();

// No authentication required - we want to capture all frontend logs
// But you can add authenticate middleware if you only want logged-in user logs
router.post("/", logFrontendEvent);
router.post("/batch", logFrontendBatch);

export default router;
