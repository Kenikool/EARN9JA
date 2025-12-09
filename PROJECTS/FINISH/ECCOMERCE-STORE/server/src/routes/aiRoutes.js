import express from "express";
import {
  getRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  trackUserBehavior,
  getSmartSearch,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/similar/:productId", getSimilarProducts);
router.get("/trending", getTrendingProducts);
router.post("/search", getSmartSearch);
router.post("/track", trackUserBehavior);

// Protected routes
router.get("/recommendations", protect, getRecommendations);

export default router;
