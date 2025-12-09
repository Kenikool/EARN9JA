import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import Settings from "../models/Settings.js";

// @desc    Get dashboard overview statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Period-specific stats
    const newUsers = await User.countDocuments({
      createdAt: { $gte: daysAgo },
    });
    const newOrders = await Order.countDocuments({
      createdAt: { $gte: daysAgo },
    });
    const periodRevenue = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: daysAgo } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          totalSold: 1,
          revenue: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          newUsers,
          newOrders,
          periodRevenue: periodRevenue[0]?.total || 0,
        },
        ordersByStatus,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get comprehensive analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getComprehensiveAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates or use defaults (last 30 days)
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Total revenue in date range
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: start, $lte: end }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        } 
      },
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const totalOrders = revenueData[0]?.count || 0;

    // Total customers in date range
    const totalCustomers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by payment gateway
    const revenueByGateway = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: start, $lte: end }
        } 
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          method: "$_id",
          total: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: start, $lte: end }
        } 
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productData"
        }
      },
      { $unwind: "$productData" },
      {
        $project: {
          name: "$productData.name",
          price: "$productData.price",
          image: { $arrayElemAt: ["$productData.images", 0] },
          sold: 1,
          revenue: 1
        }
      }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        revenueByGateway,
        topProducts
      },
    });
  } catch (error) {
    console.error("Get comprehensive analytics error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
export const getSalesAnalytics = async (req, res) => {
  try {
    const { period = "30", groupBy = "day" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    let groupFormat;
    switch (groupBy) {
      case "hour":
        groupFormat = { $dateToString: { format: "%Y-%m-%d-%H", date: "$createdAt" } };
        break;
      case "day":
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "week":
        groupFormat = { $week: "$createdAt" };
        break;
      case "month":
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const salesData = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by payment method
    const revenueByPaymentMethod = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        salesData,
        revenueByPaymentMethod,
      },
    });
  } catch (error) {
    console.error("Get sales analytics error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sales analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get customer analytics
// @route   GET /api/admin/analytics/customers
// @access  Private/Admin
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // New customers over time
    const newCustomers = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Customer by role
    const customersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Top customers by spending
    const topCustomers = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          orderCount: 1,
        },
      },
    ]);

    // Customer retention (repeat customers)
    const repeatCustomers = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: "$user", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: "total" },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        newCustomers,
        customersByRole,
        topCustomers,
        repeatCustomersCount: repeatCustomers[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get customer analytics error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch customer analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/admin/analytics/products
// @access  Private/Admin
export const getProductAnalytics = async (req, res) => {
  try {
    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          categoryName: "$category.name",
          count: 1,
          avgPrice: 1,
        },
      },
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      countInStock: { $lt: 10, $gt: 0 },
    })
      .select("name countInStock price")
      .limit(20);

    // Out of stock products
    const outOfStockCount = await Product.countDocuments({ countInStock: 0 });

    // Products by rating
    const productsByRating = await Product.aggregate([
      {
        $bucket: {
          groupBy: "$rating",
          boundaries: [0, 1, 2, 3, 4, 5],
          default: "No rating",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Most reviewed products
    const mostReviewedProducts = await Review.aggregate([
      {
        $group: {
          _id: "$product",
          reviewCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          reviewCount: 1,
          avgRating: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        productsByCategory,
        lowStockProducts,
        outOfStockCount,
        productsByRating,
        mostReviewedProducts,
      },
    });
  } catch (error) {
    console.error("Get product analytics error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch product analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Revenue breakdown
    const revenueBreakdown = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalItems: { $sum: "$itemsPrice" },
          totalShipping: { $sum: "$shippingPrice" },
          totalTax: { $sum: "$taxPrice" },
          totalDiscount: { $sum: "$discount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: daysAgo } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          itemsSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Average order value trend
    const avgOrderValueTrend = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          avgOrderValue: { $avg: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        revenueBreakdown: revenueBreakdown[0] || {},
        revenueByCategory,
        avgOrderValueTrend,
      },
    });
  } catch (error) {
    console.error("Get revenue analytics error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch revenue analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user management list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin", "vendor"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User role updated successfully",
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update user role",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete your own account",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// IP Whitelist Management

import IPWhitelist from "../models/IPWhitelist.js";

// @desc    Get all whitelisted IPs
// @route   GET /api/admin/ip-whitelist
// @access  Private/Admin
export const getIPWhitelist = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const whitelist = await IPWhitelist.find()
      .populate("addedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await IPWhitelist.countDocuments();

    res.status(200).json({
      status: "success",
      data: {
        whitelist,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get IP whitelist error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch IP whitelist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Add IP to whitelist
// @route   POST /api/admin/ip-whitelist
// @access  Private/Admin
export const addIPToWhitelist = async (req, res) => {
  try {
    const { ipAddress, description, expiresAt } = req.body;

    if (!ipAddress) {
      return res.status(400).json({
        status: "error",
        message: "IP address is required",
      });
    }

    // Check if IP already exists
    const existing = await IPWhitelist.findOne({ ipAddress });
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "IP address is already whitelisted",
      });
    }

    const whitelistEntry = await IPWhitelist.create({
      ipAddress,
      description,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      addedBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      message: "IP address added to whitelist",
      data: { whitelistEntry },
    });
  } catch (error) {
    console.error("Add IP to whitelist error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add IP to whitelist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Remove IP from whitelist
// @route   DELETE /api/admin/ip-whitelist/:id
// @access  Private/Admin
export const removeIPFromWhitelist = async (req, res) => {
  try {
    const whitelistEntry = await IPWhitelist.findByIdAndDelete(req.params.id);

    if (!whitelistEntry) {
      return res.status(404).json({
        status: "error",
        message: "Whitelist entry not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "IP address removed from whitelist",
    });
  } catch (error) {
    console.error("Remove IP from whitelist error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to remove IP from whitelist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update IP whitelist entry
// @route   PUT /api/admin/ip-whitelist/:id
// @access  Private/Admin
export const updateIPWhitelist = async (req, res) => {
  try {
    const { description, isActive, expiresAt } = req.body;

    const whitelistEntry = await IPWhitelist.findByIdAndUpdate(
      req.params.id,
      {
        description,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!whitelistEntry) {
      return res.status(404).json({
        status: "error",
        message: "Whitelist entry not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Whitelist entry updated",
      data: { whitelistEntry },
    });
  } catch (error) {
    console.error("Update IP whitelist error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update whitelist entry",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Rate Limit Monitoring

import RateLimitViolation from "../models/RateLimitViolation.js";

// @desc    Get rate limit violations with filtering and analytics
// @route   GET /api/admin/rate-limit-violations
// @access  Private/Admin
export const getRateLimitViolations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query filters
    const query = {};
    
    if (req.query.ipAddress) {
      query.ipAddress = req.query.ipAddress;
    }
    
    if (req.query.endpoint) {
      query.endpoint = { $regex: req.query.endpoint, $options: "i" };
    }
    
    if (req.query.severity) {
      query.severity = req.query.severity;
    }
    
    if (req.query.resolved !== undefined) {
      query.resolved = req.query.resolved === "true";
    }
    
    if (req.query.user) {
      query.user = req.query.user;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) {
        query.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    // Get violations
    const violations = await RateLimitViolation.find(query)
      .populate("user", "name email")
      .populate("resolvedBy", "name email")
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await RateLimitViolation.countDocuments(query);

    // Get summary statistics
    const stats = await RateLimitViolation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalViolations: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] },
          },
          highCount: {
            $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] },
          },
          mediumCount: {
            $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] },
          },
          lowCount: {
            $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] },
          },
          resolvedCount: {
            $sum: { $cond: ["$resolved", 1, 0] },
          },
          unresolvedCount: {
            $sum: { $cond: [{ $not: "$resolved" }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        violations,
        statistics: stats[0] || {
          totalViolations: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          resolvedCount: 0,
          unresolvedCount: 0,
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get rate limit violations error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch rate limit violations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get rate limit analytics and trends
// @route   GET /api/admin/rate-limit-analytics
// @access  Private/Admin
export const getRateLimitAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Violations over time (daily breakdown)
    const violationsTrend = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] },
          },
          high: {
            $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] },
          },
          medium: {
            $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] },
          },
          low: {
            $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top offending IPs
    const topIPs = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          endpoints: { $addToSet: "$endpoint" },
          lastViolation: { $max: "$timestamp" },
          avgExcess: { $avg: { $subtract: ["$requestCount", "$limit"] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Most targeted endpoints
    const topEndpoints = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$endpoint",
          count: { $sum: 1 },
          uniqueIPs: { $addToSet: "$ipAddress" },
          avgExcess: { $avg: { $subtract: ["$requestCount", "$limit"] } },
        },
      },
      {
        $project: {
          endpoint: "$_id",
          count: 1,
          uniqueIPCount: { $size: "$uniqueIPs" },
          avgExcess: { $round: ["$avgExcess", 2] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Geographic distribution
    const geographicDistribution = await RateLimitViolation.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          "location.country": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$location.country",
          count: { $sum: 1 },
          cities: { $addToSet: "$location.city" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    // Hourly pattern analysis
    const hourlyPattern = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: "$timestamp" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User vs Anonymous violations
    const userVsAnonymous = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $cond: [{ $ifNull: ["$user", false] }, "authenticated", "anonymous"] },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        period: {
          days,
          startDate,
          endDate: new Date(),
        },
        trends: {
          daily: violationsTrend,
          hourly: hourlyPattern,
        },
        topOffenders: {
          ips: topIPs,
          endpoints: topEndpoints,
        },
        geographic: geographicDistribution,
        userBreakdown: userVsAnonymous,
      },
    });
  } catch (error) {
    console.error("Get rate limit analytics error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch rate limit analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get detailed violation by ID
// @route   GET /api/admin/rate-limit-violations/:id
// @access  Private/Admin
export const getRateLimitViolationById = async (req, res) => {
  try {
    const violation = await RateLimitViolation.findById(req.params.id)
      .populate("user", "name email role")
      .populate("resolvedBy", "name email");

    if (!violation) {
      return res.status(404).json({
        status: "error",
        message: "Violation not found",
      });
    }

    // Get related violations from same IP
    const relatedViolations = await RateLimitViolation.find({
      ipAddress: violation.ipAddress,
      _id: { $ne: violation._id },
    })
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      status: "success",
      data: {
        violation,
        relatedViolations,
      },
    });
  } catch (error) {
    console.error("Get violation by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch violation details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Mark violation as resolved
// @route   PUT /api/admin/rate-limit-violations/:id/resolve
// @access  Private/Admin
export const resolveRateLimitViolation = async (req, res) => {
  try {
    const { notes } = req.body;

    const violation = await RateLimitViolation.findByIdAndUpdate(
      req.params.id,
      {
        resolved: true,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        notes: notes || violation.notes,
      },
      { new: true }
    ).populate("resolvedBy", "name email");

    if (!violation) {
      return res.status(404).json({
        status: "error",
        message: "Violation not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Violation marked as resolved",
      data: { violation },
    });
  } catch (error) {
    console.error("Resolve violation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to resolve violation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Bulk resolve violations
// @route   PUT /api/admin/rate-limit-violations/bulk-resolve
// @access  Private/Admin
export const bulkResolveViolations = async (req, res) => {
  try {
    const { violationIds, notes } = req.body;

    if (!violationIds || !Array.isArray(violationIds) || violationIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Violation IDs array is required",
      });
    }

    const result = await RateLimitViolation.updateMany(
      { _id: { $in: violationIds } },
      {
        resolved: true,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        notes,
      }
    );

    res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} violations marked as resolved`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Bulk resolve violations error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to bulk resolve violations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete old resolved violations
// @route   DELETE /api/admin/rate-limit-violations/cleanup
// @access  Private/Admin
export const cleanupResolvedViolations = async (req, res) => {
  try {
    const daysOld = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await RateLimitViolation.deleteMany({
      resolved: true,
      resolvedAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      status: "success",
      message: `Deleted ${result.deletedCount} old resolved violations`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Cleanup violations error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to cleanup violations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get real-time rate limit dashboard stats
// @route   GET /api/admin/rate-limit-dashboard
// @access  Private/Admin
export const getRateLimitDashboard = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Current active violations (last hour)
    const activeViolations = await RateLimitViolation.countDocuments({
      timestamp: { $gte: lastHour },
      resolved: false,
    });

    // Critical violations needing attention
    const criticalViolations = await RateLimitViolation.countDocuments({
      timestamp: { $gte: last24Hours },
      severity: "critical",
      resolved: false,
    });

    // Violations in last 24 hours
    const last24HoursCount = await RateLimitViolation.countDocuments({
      timestamp: { $gte: last24Hours },
    });

    // Top 5 IPs in last hour
    const topRecentIPs = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: lastHour } } },
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Blocked vs Whitelisted
    const blockedVsWhitelisted = await RateLimitViolation.aggregate([
      { $match: { timestamp: { $gte: last24Hours } } },
      {
        $group: {
          _id: "$blocked",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          activeViolations,
          criticalViolations,
          last24HoursCount,
        },
        topRecentIPs,
        blockedVsWhitelisted,
        lastUpdated: now,
      },
    });
  } catch (error) {
    console.error("Get rate limit dashboard error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      status: "success",
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Update only provided fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id" && key !== "createdAt" && key !== "updatedAt" && key !== "__v") {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    res.status(200).json({
      status: "success",
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
