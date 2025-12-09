import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc    Get user's wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist.product")
      .select("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out any wishlist items where product was deleted
    const items = user.wishlist
      .filter((item) => item.product)
      .map((item) => ({
        _id: item._id,
        addedAt: item.addedAt,
        product: {
          _id: item.product._id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price: item.product.price,
          compareAtPrice: item.product.compareAtPrice,
          images: item.product.images,
          averageRating: item.product.averageRating,
          totalReviews: item.product.totalReviews,
          stock: item.product.stock,
        },
      }));

    res.status(200).json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/user/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product is already in wishlist
    const existingItem = user.wishlist.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Product is already in wishlist",
      });
    }

    // Add to wishlist
    user.wishlist.push({
      product: productId,
      addedAt: new Date(),
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: {
        productId,
      },
    });
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding product to wishlist",
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find and remove the product from wishlist
    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(
      (item) => item.product.toString() !== productId
    );

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: {
        productId,
      },
    });
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing product from wishlist",
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/user/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.wishlist = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: {
        cleared: true,
      },
    });
  } catch (error) {
    console.error("Clear Wishlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist",
    });
  }
};
