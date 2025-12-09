import Coupon from "../models/Coupon.js";

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.code = { $regex: search, $options: "i" };
    }

    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      status: "success",
      data: {
        coupons,
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch coupons",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !expiresAt || !usageLimit) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        status: "error",
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      message: "Coupon created successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create coupon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
    } = req.body;

    // If code is being changed, check if new code already exists
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          status: "error",
          message: "Coupon code already exists",
        });
      }
      coupon.code = code.toUpperCase();
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiresAt) coupon.expiresAt = expiresAt;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
      status: "success",
      message: "Coupon updated successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update coupon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete coupon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({
        status: "error",
        message: "Please provide coupon code and order total",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        status: "error",
        message: "This coupon is no longer active",
      });
    }

    // Check if coupon has expired
    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "This coupon has expired",
      });
    }

    // Check if usage limit reached
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        status: "error",
        message: "This coupon has reached its usage limit",
      });
    }

    // Check minimum purchase requirement
    if (orderTotal < coupon.minPurchase) {
      return res.status(400).json({
        status: "error",
        message: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} required`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      status: "success",
      message: "Coupon applied successfully",
      data: {
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discount,
        newTotal: orderTotal - discount,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to validate coupon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// @desc    Get active coupons for users
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }, // Has remaining uses
    })
      .select('code discountType discountValue minPurchase maxDiscount expiresAt usageLimit usedCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        coupons,
      },
    });
  } catch (error) {
    console.error('Get active coupons error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch active coupons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// @desc    Send coupon to all users via email
// @route   POST /api/admin/coupons/:id/send-email
// @access  Private/Admin
export const sendCouponEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({
        status: 'error',
        message: 'Coupon not found',
      });
    }

    // Get all users
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ role: 'user', isEmailVerified: true }).select('name email');
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No verified users found',
      });
    }

    // Import email utilities
    const { sendEmail } = await import('../utils/sendEmail.js');
    const { emailTemplates } = await import('../utils/emailTemplates.js');

    // Send emails to all users (in batches to avoid overwhelming the email service)
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const emailContent = emailTemplates.couponAnnouncement(user.name, coupon);
        await sendEmail({
          to: user.email,
          ...emailContent,
        });
        successCount++;
      } catch (emailError) {
        console.error(`Failed to send coupon email to ${user.email}:`, emailError);
        failCount++;
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Coupon email sent to ${successCount} users${failCount > 0 ? `, ${failCount} failed` : ''}`,
      data: {
        totalUsers: users.length,
        successCount,
        failCount,
      },
    });
  } catch (error) {
    console.error('Send coupon email error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send coupon emails',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
