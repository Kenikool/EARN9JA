import express from "express";
import {
  requestEmailChange,
  verifyOldEmail,
  verifyNewEmail,
} from "../controllers/emailChangeController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/change-request", authenticate, requestEmailChange);
router.get("/verify-old/:token", verifyOldEmail);
router.get("/verify-new/:token", verifyNewEmail);

export default router;
