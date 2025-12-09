import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  markOrderAsPaid,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/", protect, admin, getAllOrders);
router.get("/stats", protect, admin, getOrderStats);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.put("/:id/mark-paid", protect, admin, markOrderAsPaid);

export default router;
