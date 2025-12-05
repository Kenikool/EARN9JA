import { Router } from "express";
import { currencyController } from "../controllers/currency.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { currencyValidators } from "../validators/currency.validator";

const router = Router();

// Public routes
router.get("/rates", currencyController.getRates);
router.get(
  "/rate/:from/:to",
  currencyValidators.getRate,
  validationMiddleware,
  currencyController.getRate
);
router.get("/status", currencyController.getCacheStatus);

// Protected routes (require authentication)
router.post(
  "/convert",
  authenticate,
  currencyValidators.convert,
  validationMiddleware,
  currencyController.convert
);
router.post(
  "/convert-batch",
  authenticate,
  currencyValidators.convertBatch,
  validationMiddleware,
  currencyController.convertBatch
);
router.get(
  "/history/:from/:to",
  authenticate,
  currencyValidators.getRateHistory,
  validationMiddleware,
  currencyController.getRateHistory
);

// Admin only routes
router.post(
  "/refresh",
  authenticate,
  // Add admin check middleware here if you have one
  currencyController.forceRefresh
);

export default router;
