import express from "express";
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  getAllReviews,
  approveReview,
} from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.post("/", protect, createReview);
router.get("/my-reviews", protect, getMyReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.put("/:id/helpful", protect, markReviewHelpful);
router.put("/:id/report", protect, reportReview);

// Admin routes
router.get("/", protect, admin, getAllReviews);
router.put("/:id/approve", protect, admin, approveReview);

export default router;
