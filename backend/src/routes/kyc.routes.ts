import { Router } from "express";
import { kycController } from "../controllers/kyc.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  submitKYCSchema,
  rejectKYCSchema,
} from "../validators/kyc.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/kyc/submit
 * @desc    Submit KYC verification
 * @access  Private
 */
router.post(
  "/submit",
  validateRequest(submitKYCSchema),
  kycController.submitKYC
);

/**
 * @route   GET /api/v1/kyc/status
 * @desc    Get KYC verification status
 * @access  Private
 */
router.get("/status", kycController.getKYCStatus);

/**
 * @route   GET /api/v1/kyc/pending
 * @desc    Get pending KYC verifications (Admin only)
 * @access  Private (Admin)
 */
router.get("/pending", kycController.getPendingKYCs);

/**
 * @route   POST /api/v1/kyc/:kycId/approve
 * @desc    Approve KYC verification (Admin only)
 * @access  Private (Admin)
 */
router.post("/:kycId/approve", kycController.approveKYC);

/**
 * @route   POST /api/v1/kyc/:kycId/reject
 * @desc    Reject KYC verification (Admin only)
 * @access  Private (Admin)
 */
router.post(
  "/:kycId/reject",
  validateRequest(rejectKYCSchema),
  kycController.rejectKYC
);

export default router;
