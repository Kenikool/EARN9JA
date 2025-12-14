import { Router } from "express";
import notificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import * as pushNotificationController from "../controllers/pushNotification.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);

// Mark all as read
router.patch("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Register FCM token
router.post("/register-token", pushNotificationController.registerToken);

// Unregister FCM token
router.delete("/unregister-token", pushNotificationController.unregisterToken);

export default router;
