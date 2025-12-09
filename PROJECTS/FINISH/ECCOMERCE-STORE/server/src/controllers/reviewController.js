import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { product, rating, comment, title } = req.body;

    // Validation
    if (!product || !rating) {
      return res.status(400).json({
        status: "error",
        message: "Product and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: "error",
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Check if user has purchased the product
    const productObjectId = new mongoose.Types.ObjectId(product);
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "items.product": productObjectId,
      isPaid: true,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        status: "error",
        message: "You can only review products you have purchased",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product,
    });

    if (existingReview) {
      return res.status(400).json({
        status: "error",
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      product,
      rating,
      comment,
      title,
    });

    // Update product rating
    await updateProductRating(product);

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name avatar")
      .populate("product", "name");

    res.status(201).json({
      status: "success",
      message: "Review created successfully",
      data: { review: populatedReview },
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { sort = "-createdAt", rating } = req.query;

    const filter = { product: productId, isApproved: true };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const reviews = await Review.find(filter)
      .populate("user", "name avatar")
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments(filter);

    // Get rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        reviews,
        ratingBreakdown,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ user: req.user._id });

    res.status(200).json({
      status: "success",
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this review",
      });
    }

    const { rating, comment, title } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          status: "error",
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) review.comment = comment;
    if (title !== undefined) review.title = title;

    const updatedReview = await review.save();

    // Update product rating
    await updateProductRating(review.product);

    const populatedReview = await Review.findById(updatedReview._id)
      .populate("user", "name avatar")
      .populate("product", "name");

    res.status(200).json({
      status: "success",
      message: "Review updated successfully",
      data: { review: populatedReview },
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    // Check if user owns the review or is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this review",
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    await updateProductRating(productId);

    res.status(200).json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulVotes.includes(req.user._id);

    if (alreadyMarked) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add vote
      review.helpfulVotes.push(req.user._id);
    }

    await review.save();

    res.status(200).json({
      status: "success",
      message: alreadyMarked ? "Helpful vote removed" : "Marked as helpful",
      data: {
        helpfulCount: review.helpfulVotes.length,
        isHelpful: !alreadyMarked,
      },
    });
  } catch (error) {
    console.error("Mark review helpful error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to mark review as helpful",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Report a review
// @route   PUT /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        status: "error",
        message: "Report reason is required",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    // Check if user already reported
    const alreadyReported = review.reports.some(
      (report) => report.user.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({
        status: "error",
        message: "You have already reported this review",
      });
    }

    review.reports.push({
      user: req.user._id,
      reason,
    });

    await review.save();

    res.status(200).json({
      status: "success",
      message: "Review reported successfully",
    });
  } catch (error) {
    console.error("Report review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to report review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, rating } = req.query;

    const filter = {};

    if (status === "pending") filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;
    if (rating) filter.rating = parseInt(rating);

    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Approve/Reject review (Admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
export const approveReview = async (req, res) => {
  try {
    const { isApproved } = req.body;

    if (isApproved === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Approval status is required",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    review.isApproved = isApproved;
    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    res.status(200).json({
      status: "success",
      message: `Review ${isApproved ? "approved" : "rejected"} successfully`,
      data: { review },
    });
  } catch (error) {
    console.error("Approve review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update review status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      numReviews: reviews.length,
    });
  } catch (error) {
    console.error("Update product rating error:", error);
  }
}
