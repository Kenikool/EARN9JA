import express from "express";
import {
  deactivateUserAccount,
  reactivateUserAccount,
  scheduleUserAccountDeletion,
  cancelUserAccountDeletion,
  getAccountStatus,
} from "../controllers/accountController.js";
import {
  requestDataExport,
  downloadDataExport,
  getExportStatus,
} from "../controllers/dataExportController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/reactivate", reactivateUserAccount);

// Protected routes
router.use(authenticate);
router.get("/status", getAccountStatus);
router.post("/deactivate", deactivateUserAccount);
router.post("/delete", scheduleUserAccountDeletion);
router.post("/cancel-deletion", cancelUserAccountDeletion);
router.post("/export-data", requestDataExport);
router.get("/download-data", downloadDataExport);
router.get("/export-status", getExportStatus);

export default router;
