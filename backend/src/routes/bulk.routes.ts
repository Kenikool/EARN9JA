import { Router } from "express";
import { BulkController } from "../controllers/bulk.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Download CSV template
router.get("/template", BulkController.downloadTemplate);

// Validate CSV
router.post("/validate", BulkController.validateCSV);

// Create tasks in bulk
router.post("/create", BulkController.createBulkTasks);

// Apply template with variables
router.post("/apply-template", BulkController.applyTemplate);

export default router;
