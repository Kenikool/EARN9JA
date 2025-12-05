import { Router } from "express";
import { postbackController } from "../controllers/postback.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public webhook endpoint (no auth required - providers call this)
router.post("/:providerId", postbackController.handlePostback);
router.get("/:providerId", postbackController.handlePostback); // Some providers use GET

// Protected endpoints (require authentication)
router.get(
  "/transaction/:transactionId",
  authenticate,
  postbackController.getTransactionStatus
);

router.get(
  "/user/:userId/transactions",
  authenticate,
  postbackController.getUserTransactions
);

// Admin endpoints
router.get(
  "/provider/:providerId/stats",
  authenticate,
  // Add admin check middleware here
  postbackController.getProviderStats
);

// Test endpoint (development only)
router.post("/test", postbackController.testPostback);

export default router;
