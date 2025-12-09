import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import VendorPayout from "../models/VendorPayout.js";
import User from "../models/User.js";

// @desc    Register as vendor
// @route   POST /api/vendor/register
// @access  Private
export const registerVendor = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      businessPhone,
      description,
      address,
      taxId,
      bankDetails,
    } = req.body;

    // Check if user already has a vendor account
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({
        status: "error",
        message: "You already have a vendor account",
      });
    }

    // Create vendor
    const vendor = await Vendor.create({
      user: req.user._id,
      businessName,
      businessEmail: businessEmail || req.user.email,
      businessPhone,
      description,
      address,
      taxId,
      bankDetails,
    });

    res.status(201).json({
      status: "success",
      message: "Vendor registration submitted. Awaiting admin approval.",
      data: { vendor },
    });
  } catch (error) {
    console.error("Register vendor error:", error);
    res.status(500).json({
      status: "error",
      message: "Vendor registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendor/profile
// @access  Private/Vendor
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { vendor },
    });
  } catch (error) {
    console.error("Get vendor profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendor profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendor/profile
// @access  Private/Vendor
export const updateVendorProfile = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      businessPhone,
      description,
      logo,
      banner,
      address,
      taxId,
      bankDetails,
    } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    // Update fields
    if (businessName) vendor.businessName = businessName;
    if (businessEmail) vendor.businessEmail = businessEmail;
    if (businessPhone) vendor.businessPhone = businessPhone;
    if (description) vendor.description = description;
    if (logo) vendor.logo = logo;
    if (banner) vendor.banner = banner;
    if (address) vendor.address = address;
    if (taxId) vendor.taxId = taxId;
    if (bankDetails) vendor.bankDetails = bankDetails;

    await vendor.save();

    res.status(200).json({
      status: "success",
      message: "Vendor profile updated successfully",
      data: { vendor },
    });
  } catch (error) {
    console.error("Update vendor profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update vendor profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
export const getVendorDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    // Get total products
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });

    // Get total orders
    const orders = await Order.find({
      "items.product": { $in: await Product.find({ vendor: vendor._id }).distinct("_id") },
    });

    // Calculate revenue
    let totalRevenue = 0;
    let pendingPayouts = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.vendor.toString() === vendor._id.toString()) {
          const itemTotal = item.price * item.quantity;
          const vendorShare = itemTotal * (1 - vendor.commission / 100);
          totalRevenue += vendorShare;
        }
      }
    }

    // Get pending payouts
    const payouts = await VendorPayout.find({
      vendor: vendor._id,
      status: "pending",
    });
    pendingPayouts = payouts.reduce((sum, payout) => sum + payout.amount, 0);

    // Recent orders
    const recentOrders = orders.slice(0, 10);

    res.status(200).json({
      status: "success",
      data: {
        vendor,
        stats: {
          totalProducts,
          totalOrders: orders.length,
          totalRevenue,
          pendingPayouts,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get vendor dashboard error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendor dashboard",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get vendor orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
export const getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    const productIds = await Product.find({ vendor: vendor._id }).distinct("_id");

    const orders = await Order.find({
      "items.product": { $in: productIds },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { orders },
    });
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendor orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get vendor products
// @route   GET /api/vendor/products
// @access  Private/Vendor
export const getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    const products = await Product.find({ vendor: vendor._id })
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { products },
    });
  } catch (error) {
    console.error("Get vendor products error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendor products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get vendor payouts
// @route   GET /api/vendor/payouts
// @access  Private/Vendor
export const getVendorPayouts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    const payouts = await VendorPayout.find({ vendor: vendor._id })
      .populate("orders")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { payouts },
    });
  } catch (error) {
    console.error("Get vendor payouts error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendor payouts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Request payout
// @route   POST /api/vendor/payout/request
// @access  Private/Vendor
export const requestPayout = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    if (vendor.status !== "active") {
      return res.status(400).json({
        status: "error",
        message: "Vendor account must be active to request payouts",
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payout amount",
      });
    }

    // Create payout request
    const payout = await VendorPayout.create({
      vendor: vendor._id,
      amount,
      paymentMethod,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      message: "Payout request submitted successfully",
      data: { payout },
    });
  } catch (error) {
    console.error("Request payout error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to request payout",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get vendor reviews
// @route   GET /api/vendor/reviews
// @access  Private/Vendor
export const getVendorReviews = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    const productIds = await Product.find({ vendor: vendor._id }).distinct("_id");

    const Review = (await import("../models/Review.js")).default;
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("user", "name")
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { reviews },
    });
  } catch (error) {
    console.error("Get vendor reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendor reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
