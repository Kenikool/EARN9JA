import express from "express";
import {
  getUserSessions,
  revokeSession,
  logoutAllDevices,
  extendSession,
} from "../controllers/sessionController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getUserSessions);
router.delete("/all", logoutAllDevices);
router.post("/extend", extendSession);
router.delete("/:id", revokeSession);

export default router;
