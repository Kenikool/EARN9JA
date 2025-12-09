import express from "express";
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { getComparison } from "../services/comparisonService.js";
import { authenticate, authorizeAdminOrVendor } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/compare", getComparison);
router.get("/:slug", getProduct);
router.get("/:id/related", getRelatedProducts);

// Protected routes (Admin/Vendor)
router.post("/", authenticate, authorizeAdminOrVendor, createProduct);
router.put("/:id", authenticate, authorizeAdminOrVendor, updateProduct);
router.delete("/:id", authenticate, authorizeAdminOrVendor, deleteProduct);

export default router;
