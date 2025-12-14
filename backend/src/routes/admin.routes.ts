import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import * as platformSettingsController from "../controllers/platformSettings.controller.js";
import * as bulkMessageController from "../controllers/bulkMessage.controller.js";
import * as pushNotificationController from "../controllers/pushNotification.controller.js";
import * as appVersionController from "../controllers/appVersion.controller.js";

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

// Platform Settings
/**
 * @route   GET /api/v1/admin/settings
 * @desc    Get platform settings
 * @access  Admin
 */
router.get("/settings", platformSettingsController.getSettings);

/**
 * @route   PATCH /api/v1/admin/settings
 * @desc    Update platform settings
 * @access  Admin
 */
router.patch("/settings", platformSettingsController.updateSettings);

/**
 * @route   POST /api/v1/admin/settings/reset
 * @desc    Reset settings to defaults
 * @access  Admin
 */
router.post("/settings/reset", platformSettingsController.resetSettings);

/**
 * @route   GET /api/v1/admin/settings/audit
 * @desc    Get settings audit log
 * @access  Admin
 */
router.get("/settings/audit", platformSettingsController.getAuditLog);

/**
 * @route   GET /api/v1/admin/settings/audit/export
 * @desc    Export settings audit log to CSV
 * @access  Admin
 */
router.get("/settings/audit/export", platformSettingsController.exportAuditLog);

// Bulk Messaging
/**
 * @route   POST /api/v1/admin/messages
 * @desc    Create a bulk message
 * @access  Admin
 */
router.post("/messages", bulkMessageController.createMessage);

/**
 * @route   POST /api/v1/admin/messages/:id/send
 * @desc    Send a bulk message
 * @access  Admin
 */
router.post("/messages/:id/send", bulkMessageController.sendMessage);

/**
 * @route   POST /api/v1/admin/messages/:id/schedule
 * @desc    Schedule a bulk message
 * @access  Admin
 */
router.post("/messages/:id/schedule", bulkMessageController.scheduleMessage);

/**
 * @route   DELETE /api/v1/admin/messages/:id
 * @desc    Cancel a scheduled message
 * @access  Admin
 */
router.delete("/messages/:id", bulkMessageController.cancelMessage);

/**
 * @route   GET /api/v1/admin/messages/:id/status
 * @desc    Get message delivery status
 * @access  Admin
 */
router.get("/messages/:id/status", bulkMessageController.getMessageStatus);

/**
 * @route   GET /api/v1/admin/messages
 * @desc    Get all messages
 * @access  Admin
 */
router.get("/messages", bulkMessageController.getMessages);

// Message Templates
/**
 * @route   POST /api/v1/admin/templates
 * @desc    Create a message template
 * @access  Admin
 */
router.post("/templates", bulkMessageController.createTemplate);

/**
 * @route   GET /api/v1/admin/templates
 * @desc    Get all templates
 * @access  Admin
 */
router.get("/templates", bulkMessageController.getTemplates);

/**
 * @route   PATCH /api/v1/admin/templates/:id
 * @desc    Update a template
 * @access  Admin
 */
router.patch("/templates/:id", bulkMessageController.updateTemplate);

/**
 * @route   DELETE /api/v1/admin/templates/:id
 * @desc    Delete a template
 * @access  Admin
 */
router.delete("/templates/:id", bulkMessageController.deleteTemplate);

// Push Notifications
/**
 * @route   POST /api/v1/admin/push-notifications
 * @desc    Send push notifications to users
 * @access  Admin
 */
router.post(
  "/push-notifications",
  pushNotificationController.sendPushNotification
);

// App Version Management
/**
 * @route   GET /api/v1/admin/versions
 * @desc    Get all app versions
 * @access  Admin
 */
router.get("/versions", appVersionController.getAllVersions);

/**
 * @route   POST /api/v1/admin/versions
 * @desc    Create/update app version
 * @access  Admin
 */
router.post("/versions", appVersionController.updateVersionConfig);

/**
 * @route   GET /api/v1/admin/versions/analytics
 * @desc    Get version adoption analytics
 * @access  Admin
 */
router.get("/versions/analytics", appVersionController.getVersionAnalytics);

export default router;
