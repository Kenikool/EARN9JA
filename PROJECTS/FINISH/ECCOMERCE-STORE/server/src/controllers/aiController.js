import axios from "axios";
import Product from "../models/Product.js";
import ProductView from "../models/ProductView.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5000";

// @desc    Get personalized recommendations for user
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Call Python ML service
    const response = await axios.get(
      `${ML_SERVICE_URL}/recommendations/user/${userId}`,
      { params: { limit } }
    );

    res.status(200).json({
      status: "success",
      data: { products: response.data.data },
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    
    // Fallback to simple recommendations if ML service is down
    try {
      const products = await Product.find({ isActive: true })
        .sort({ sold: -1 })
        .limit(10)
        .select("name price images averageRating");

      res.status(200).json({
        status: "success",
        data: { products },
        fallback: true,
      });
    } catch (fallbackError) {
      res.status(500).json({
        status: "error",
        message: "Failed to get recommendations",
      });
    }
  }
};

// @desc    Get similar products
// @route   GET /api/ai/similar/:productId
// @access  Public
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Call Python ML service
    const response = await axios.get(
      `${ML_SERVICE_URL}/recommendations/similar/${productId}`,
      { params: { limit } }
    );

    res.status(200).json({
      status: "success",
      data: { products: response.data.data },
    });
  } catch (error) {
    console.error("Get similar products error:", error);
    
    // Fallback to category-based recommendations
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      const similar = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        isActive: true,
      })
        .limit(10)
        .select("name price images averageRating");

      res.status(200).json({
        status: "success",
        data: { products: similar },
        fallback: true,
      });
    } catch (fallbackError) {
      res.status(500).json({
        status: "error",
        message: "Failed to get similar products",
      });
    }
  }
};

// @desc    Get trending products
// @route   GET /api/ai/trending
// @access  Public
export const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    // Call Python ML service
    const response = await axios.get(`${ML_SERVICE_URL}/recommendations/trending`, {
      params: { limit, days },
    });

    res.status(200).json({
      status: "success",
      data: { products: response.data.data },
    });
  } catch (error) {
    console.error("Get trending products error:", error);
    
    // Fallback to most sold products
    try {
      const products = await Product.find({ isActive: true })
        .sort({ sold: -1, views: -1 })
        .limit(10)
        .select("name price images averageRating sold views");

      res.status(200).json({
        status: "success",
        data: { products },
        fallback: true,
      });
    } catch (fallbackError) {
      res.status(500).json({
        status: "error",
        message: "Failed to get trending products",
      });
    }
  }
};

// @desc    Track user behavior (view, click, etc.)
// @route   POST /api/ai/track
// @access  Public
export const trackUserBehavior = async (req, res) => {
  try {
    const { productId, action = "view" } = req.body;
    const userId = req.user?._id;

    // Save to database
    await ProductView.create({
      user: userId,
      product: productId,
      timestamp: new Date(),
    });

    // Update product view count
    await Product.findByIdAndUpdate(productId, {
      $inc: { views: 1 },
    });

    // Call Python ML service to track
    if (userId) {
      try {
        await axios.post(`${ML_SERVICE_URL}/track/view`, {
          userId: userId.toString(),
          productId,
        });
      } catch (mlError) {
        console.error("ML service tracking error:", mlError.message);
        // Continue even if ML service fails
      }
    }

    res.status(200).json({
      status: "success",
      message: "Behavior tracked",
    });
  } catch (error) {
    console.error("Track behavior error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to track behavior",
    });
  }
};

// @desc    Get smart search suggestions
// @route   POST /api/ai/search
// @access  Public
export const getSmartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Query must be at least 2 characters",
      });
    }

    // Search products using text index
    const products = await Product.find(
      {
        $text: { $search: query },
        isActive: true,
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .select("name price images category");

    res.status(200).json({
      status: "success",
      data: { products },
    });
  } catch (error) {
    console.error("Smart search error:", error);
    res.status(500).json({
      status: "error",
      message: "Search failed",
    });
  }
};
