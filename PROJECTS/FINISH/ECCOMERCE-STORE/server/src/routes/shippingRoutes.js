import express from "express";
import {
  getShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  calculateShippingCost,
} from "../controllers/shippingController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getShippingMethods);
router.get("/:id", getShippingMethodById);
router.post("/calculate", calculateShippingCost);

// Admin routes
router.post("/", protect, admin, createShippingMethod);
router.put("/:id", protect, admin, updateShippingMethod);
router.delete("/:id", protect, admin, deleteShippingMethod);

export default router;
