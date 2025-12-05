import express from "express";
import { escrowController } from "../controllers/escrow.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Sponsor escrow routes (protected)
router.post(
  "/sponsors/deposit",
  authenticate,
  escrowController.initiateDeposit
);
router.get(
  "/sponsors/escrow-balance",
  authenticate,
  escrowController.getBalance
);

// Webhook route (public - but should verify signature)
router.post("/webhooks/escrow-payment", escrowController.handlePaymentWebhook);

export default router;
