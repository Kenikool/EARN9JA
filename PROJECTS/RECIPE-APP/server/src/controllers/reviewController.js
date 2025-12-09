import mongoose from "mongoose";
import Review from "../models/Review.js";
import Recipe from "../models/Recipe.js";

// Get all reviews for a recipe
export const getRecipeReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ recipe: req.params.recipeId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ recipe: req.params.recipeId });

    // Calculate average rating
    const stats = await Review.aggregate([
      {
        $match: { recipe: new mongoose.Types.ObjectId(req.params.recipeId) },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      stats: stats[0] || { averageRating: 0, totalReviews: 0 },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single review
export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "name avatar")
      .populate("recipe", "title slug");

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if recipe exists
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // Check if user already reviewed this recipe
    const existingReview = await Review.findOne({
      recipe: req.params.recipeId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this recipe",
      });
    }

    const review = await Review.create({
      recipe: req.params.recipeId,
      user: req.user._id,
      rating,
      comment,
    });

    await review.populate("user", "name avatar");

    res.status(201).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this review",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name avatar");

    res.status(200).json({
      status: "success",
      data: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check if user owns the review or is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this review",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.params.userId })
      .populate("recipe", "title slug featuredImage averageRating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ user: req.params.userId });

    res.status(200).json({
      status: "success",
      results: reviews.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get review statistics for a recipe
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { recipe: new mongoose.Types.ObjectId(req.params.recipeId) },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [],
        },
      });
    }

    // Calculate rating distribution
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    stats[0].ratingDistribution.forEach((rating) => {
      distribution[rating - 1]++;
    });

    res.status(200).json({
      status: "success",
      data: {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution: distribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
