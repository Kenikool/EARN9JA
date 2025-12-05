import { Router } from "express";
import { providerController } from "../controllers/provider.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats (must be before /:providerId)
router.get("/dashboard/stats", providerController.getDashboardStats);

// Provider CRUD
router.get("/", providerController.getAllProviders);
router.get("/:providerId", providerController.getProviderById);
router.post("/", providerController.createProvider);
router.put("/:providerId", providerController.updateProvider);
router.delete("/:providerId", providerController.deleteProvider);

// Provider status management
router.patch("/:providerId/status", providerController.updateProviderStatus);

// Provider statistics
router.get("/:providerId/stats", providerController.getProviderStats);

export default router;
