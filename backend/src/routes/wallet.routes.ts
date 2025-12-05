import { Router } from "express";
import { walletController } from "../controllers/wallet.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  withdrawalRequestSchema,
  topUpSchema,
  transactionQuerySchema,
  verifyPaymentSchema,
} from "../validators/wallet.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/wallet/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get("/balance", walletController.getBalance);

/**
 * @route   GET /api/v1/wallet/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get(
  "/transactions",
  validateRequest(transactionQuerySchema),
  walletController.getTransactions
);

/**
 * @route   POST /api/v1/wallet/withdraw
 * @desc    Request withdrawal
 * @access  Private
 */
router.post(
  "/withdraw",
  validateRequest(withdrawalRequestSchema),
  walletController.requestWithdrawal
);

/**
 * @route   POST /api/v1/wallet/topup
 * @desc    Top up wallet (Sponsor)
 * @access  Private
 */
router.post("/topup", validateRequest(topUpSchema), walletController.topUp);

/**
 * @route   GET /api/v1/wallet/withdrawal-methods
 * @desc    Get available withdrawal methods
 * @access  Private
 */
router.get("/withdrawal-methods", walletController.getWithdrawalMethods);

/**
 * @route   GET /api/v1/wallet/withdrawal-eligibility
 * @desc    Check if user is eligible for withdrawal
 * @access  Private
 */
router.get(
  "/withdrawal-eligibility",
  walletController.checkWithdrawalEligibility
);

/**
 * @route   GET /api/v1/wallet/withdrawals
 * @desc    Get user's withdrawal history
 * @access  Private
 */
router.get("/withdrawals", walletController.getWithdrawals);

/**
 * @route   POST /api/v1/wallet/withdrawals/:withdrawalId/cancel
 * @desc    Cancel a pending withdrawal
 * @access  Private
 */
router.post(
  "/withdrawals/:withdrawalId/cancel",
  walletController.cancelWithdrawal
);

/**
 * @route   POST /api/v1/wallet/verify-payment
 * @desc    Verify payment and credit wallet
 * @access  Private
 */
router.post(
  "/verify-payment",
  validateRequest(verifyPaymentSchema),
  walletController.verifyPayment
);

/**
 * @route   GET /api/v1/wallet/pending-topups
 * @desc    Get user's pending topups
 * @access  Private
 */
router.get("/pending-topups", walletController.getPendingTopups);

/**
 * @route   POST /api/v1/wallet/pending-topups/:topupId/upload-receipt
 * @desc    Upload payment receipt for pending topup
 * @access  Private
 */
router.post(
  "/pending-topups/:topupId/upload-receipt",
  walletController.uploadReceipt
);

export default router;
