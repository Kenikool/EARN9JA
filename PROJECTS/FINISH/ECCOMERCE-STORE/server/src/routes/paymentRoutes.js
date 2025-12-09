import express from "express";
import {
  initializePaymentHandler,
  verifyPaymentHandler,
  handleStripeWebhook,
  handleFlutterwaveWebhook,
  handlePaystackWebhook,
  getPaymentMethods,
  getSupportedCurrencies,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/methods", getPaymentMethods);
router.get("/currencies", getSupportedCurrencies);

// Webhook routes (public but verified)
router.post("/webhook/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);
router.post("/webhook/flutterwave", handleFlutterwaveWebhook);
router.post("/webhook/paystack", handlePaystackWebhook);

// Protected routes
router.post("/initialize", protect, initializePaymentHandler);
router.post("/verify/:reference", protect, verifyPaymentHandler);

export default router;
