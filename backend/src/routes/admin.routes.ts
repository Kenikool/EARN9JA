import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use((req: any, res, next) => {
  if (!req.user?.roles?.includes("admin")) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
});

// User Management
/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filters
 * @access  Admin
 */
router.get("/users", adminController.getAllUsers);

/**
 * @route   GET /api/v1/admin/users/:userId
 * @desc    Get user details
 * @access  Admin
 */
router.get("/users/:userId", adminController.getUserDetails);

/**
 * @route   POST /api/v1/admin/users/:userId/suspend
 * @desc    Suspend user
 * @access  Admin
 */
router.post("/users/:userId/suspend", adminController.suspendUser);

/**
 * @route   POST /api/v1/admin/users/:userId/ban
 * @desc    Ban user
 * @access  Admin
 */
router.post("/users/:userId/ban", adminController.banUser);

/**
 * @route   POST /api/v1/admin/users/:userId/reactivate
 * @desc    Reactivate user
 * @access  Admin
 */
router.post("/users/:userId/reactivate", adminController.reactivateUser);

// Task Moderation
/**
 * @route   GET /api/v1/admin/tasks
 * @desc    Get tasks with optional status filter
 * @access  Admin
 */
router.get("/tasks", adminController.getTasks);

/**
 * @route   GET /api/v1/admin/tasks/pending
 * @desc    Get pending tasks for approval
 * @access  Admin
 */
router.get("/tasks/pending", adminController.getPendingTasks);

/**
 * @route   POST /api/v1/admin/tasks/:taskId/approve
 * @desc    Approve task
 * @access  Admin
 */
router.post("/tasks/:taskId/approve", adminController.approveTask);

/**
 * @route   POST /api/v1/admin/tasks/:taskId/reject
 * @desc    Reject task
 * @access  Admin
 */
router.post("/tasks/:taskId/reject", adminController.rejectTask);

// Withdrawal Management
/**
 * @route   GET /api/v1/admin/withdrawals/pending
 * @desc    Get pending withdrawals
 * @access  Admin
 */
router.get("/withdrawals/pending", adminController.getPendingWithdrawals);

/**
 * @route   POST /api/v1/admin/withdrawals/:withdrawalId/approve
 * @desc    Approve withdrawal
 * @access  Admin
 */
router.post(
  "/withdrawals/:withdrawalId/approve",
  adminController.approveWithdrawal
);

/**
 * @route   POST /api/v1/admin/withdrawals/:withdrawalId/reject
 * @desc    Reject withdrawal
 * @access  Admin
 */
router.post(
  "/withdrawals/:withdrawalId/reject",
  adminController.rejectWithdrawal
);

// Platform Analytics
/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Admin
 */
router.get("/stats", adminController.getPlatformStats);

/**
 * @route   GET /api/v1/admin/revenue-report
 * @desc    Get revenue report
 * @access  Admin
 */
router.get("/revenue-report", adminController.getRevenueReport);

// Dispute Resolution
/**
 * @route   GET /api/v1/admin/disputes/pending
 * @desc    Get pending disputes
 * @access  Admin
 */
router.get("/disputes/pending", adminController.getPendingDisputes);

/**
 * @route   GET /api/v1/admin/disputes/:disputeId
 * @desc    Get dispute details
 * @access  Admin
 */
router.get("/disputes/:disputeId", adminController.getDisputeDetails);

/**
 * @route   POST /api/v1/admin/disputes/:disputeId/resolve
 * @desc    Resolve dispute
 * @access  Admin
 */
router.post("/disputes/:disputeId/resolve", adminController.resolveDispute);

/**
 * @route   PATCH /api/v1/admin/disputes/:disputeId/status
 * @desc    Update dispute status
 * @access  Admin
 */
router.patch(
  "/disputes/:disputeId/status",
  adminController.updateDisputeStatus
);

export default router;
