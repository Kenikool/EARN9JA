import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller.js";

const router = Router();

/**
 * @route   POST /api/v1/webhooks/paystack
 * @desc    Handle Paystack webhook events
 * @access  Public (verified by signature)
 */
router.post("/paystack", webhookController.handlePaystackWebhook);

/**
 * @route   POST /api/v1/webhooks/flutterwave
 * @desc    Handle Flutterwave webhook events
 * @access  Public (verified by signature)
 */
router.post("/flutterwave", webhookController.handleFlutterwaveWebhook);

export default router;
