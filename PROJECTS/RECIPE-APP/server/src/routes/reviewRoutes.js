import express from "express";
import { body } from "express-validator";
import {
  getRecipeReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewStats,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/recipe/:recipeId", getRecipeReviews);
router.get("/stats/:recipeId", getReviewStats);
router.get("/:id", getReview);

// Protected routes
router.use(protect); // All routes below require authentication

router.get("/user/:userId", getUserReviews);

router.post(
  "/recipe/:recipeId",
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comment must be between 10 and 1000 characters"),
  ],
  createReview
);

router.put(
  "/:id",
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comment must be between 10 and 1000 characters"),
  ],
  updateReview
);

router.delete("/:id", deleteReview);

export default router;
