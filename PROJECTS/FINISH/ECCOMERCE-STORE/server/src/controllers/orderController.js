import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import Shipping from "../models/Shipping.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentMethodDetail, // Specific payment method (card, wallet, ussd, etc.)
      shippingMethodId,
      couponCode,
      currency = "USD",
      exchangeRate = 1,
    } = req.body;

    // Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No order items provided",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        status: "error",
        message: "Shipping address is required",
      });
    }

    // Validate shipping address fields
    const requiredAddressFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    for (const field of requiredAddressFields) {
      if (
        !shippingAddress[field] ||
        shippingAddress[field].trim().length === 0
      ) {
        return res.status(400).json({
          status: "error",
          message: `Shipping address ${field} is required`,
        });
      }
    }

    // Validate country code (should be 2-letter ISO code)
    if (shippingAddress.country.length !== 2) {
      return res.status(400).json({
        status: "error",
        message: "Invalid country code",
      });
    }

    // Validate payment method
    if (
      !paymentMethod ||
      !["stripe", "flutterwave", "paystack"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment method",
      });
    }

    // Validate payment method detail if provided
    if (paymentMethodDetail) {
      const validMethods = [
        "card",
        "mobile_money",
        "ussd",
        "bank_transfer",
        "wallet",
        "mpesa",
        "account",
        "apple_pay",
        "google_pay",
        "qr_code",
        "mobile_money_ghana",
        "mobile_money_uganda",
        "mobile_money_rwanda",
      ];
      if (!validMethods.includes(paymentMethodDetail)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid payment method detail",
        });
      }
    }

    // Calculate prices
    let itemsPrice = 0;
    const processedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const price = product.salePrice || product.price;
      itemsPrice += price * item.quantity;

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        image: product.images[0],
        price,
      });
    }

    // Get shipping method
    let shippingPrice = 0;
    if (shippingMethodId) {
      const shippingMethod = await Shipping.findById(shippingMethodId);
      if (shippingMethod && shippingMethod.isActive) {
        // Use the first zone's baseRate as default shipping price
        // In a real app, you'd match the zone based on shipping address
        if (shippingMethod.zones && shippingMethod.zones.length > 0) {
          shippingPrice = shippingMethod.zones[0].baseRate;
        }
      }
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

      if (coupon) {
        const now = new Date();
        if (coupon.expiresAt && coupon.expiresAt < now) {
          return res.status(400).json({
            status: "error",
            message: "Coupon has expired",
          });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({
            status: "error",
            message: "Coupon usage limit reached",
          });
        }

        if (coupon.minPurchase && itemsPrice < coupon.minPurchase) {
          return res.status(400).json({
            status: "error",
            message: `Minimum purchase of $${coupon.minPurchase} required`,
          });
        }

        // Calculate discount
        if (coupon.discountType === "percentage") {
          discount = (itemsPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.discountValue;
        }

        appliedCoupon = {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discount,
        };

        // Update coupon usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const taxPrice = (itemsPrice - discount) * 0.1; // 10% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice - discount;

    // Calculate total in selected currency (only if exchange rate is provided)
    const finalExchangeRate = exchangeRate || 1;
    const totalPriceInCurrency = totalPrice * finalExchangeRate;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: processedItems,
      shippingAddress,
      paymentMethod, // Gateway (stripe, flutterwave, paystack)
      paymentMethodDetail, // Specific method (card, wallet, ussd, etc.)
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discount,
      couponCode: appliedCoupon?.code,
      currency: currency || "USD",
      exchangeRate: finalExchangeRate,
      totalPriceInCurrency,
    });

    // Update product stock and check for low stock
    const { checkProductStock } = await import("../utils/inventoryMonitor.js");
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity },
      });

      // Check if product is now low on stock
      checkProductStock(item.product).catch((err) =>
        console.error("Failed to check product stock:", err)
      );
    }

    // Clear user's cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Send order confirmation email
    const { sendOrderConfirmation } = await import(
      "./notificationController.js"
    );
    sendOrderConfirmation(order._id).catch((err) =>
      console.error("Failed to send order confirmation:", err)
    );

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Pay order with wallet
// @route   POST /api/orders/:id/pay-wallet
// @access  Private
export const payOrderWithWallet = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized",
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        status: "error",
        message: "Order already paid",
      });
    }

    // Get wallet
    const Wallet = (await import("../models/Wallet.js")).default;
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet || wallet.balance < order.totalPrice) {
      return res.status(400).json({
        status: "error",
        message: "Insufficient wallet balance",
      });
    }

    // Deduct from wallet
    await wallet.deductFunds(
      order.totalPrice,
      `Payment for order #${order.orderNumber}`,
      `ORDER-${order._id}`
    );

    // Update order
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: `WALLET-${Date.now()}`,
      status: "completed",
      updateTime: new Date(),
      emailAddress: req.user.email,
      gateway: "wallet",
    };

    await order.save();

    res.json({
      status: "success",
      message: "Order paid successfully with wallet",
      data: { order },
    });
  } catch (error) {
    console.error("Pay with wallet error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process wallet payment",
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to access this order",
      });
    }

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id, isPaid: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({
      user: req.user._id,
      isPaid: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, paymentStatus } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus === "paid") filter.isPaid = true;
    if (paymentStatus === "unpaid") filter.isPaid = false;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("user", "name email");

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.email_address,
      gateway: req.body.gateway,
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      status: "success",
      message: "Order marked as paid",
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error("Update order to paid error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      // Award loyalty points for completed order (1 point per dollar spent)
      try {
        const LoyaltyPoints = (await import("../models/LoyaltyPoints.js"))
          .default;
        let loyaltyPoints = await LoyaltyPoints.findOne({ user: order.user });

        if (!loyaltyPoints) {
          loyaltyPoints = await LoyaltyPoints.create({ user: order.user });
        }

        // Award 1 point per dollar (rounded)
        const pointsToAward = Math.floor(order.totalPrice);
        loyaltyPoints.addPoints(
          pointsToAward,
          `Order #${order.orderNumber} completed`
        );
        await loyaltyPoints.save();
      } catch (loyaltyError) {
        console.error("Failed to award loyalty points:", loyaltyError);
        // Don't fail the order update if loyalty points fail
      }
    }

    const updatedOrder = await order.save();

    // Send notifications based on status
    const { sendOrderShipped, sendOrderDelivered } = await import(
      "./notificationController.js"
    );

    if (status === "shipped") {
      sendOrderShipped(order._id, order.trackingNumber).catch((err) =>
        console.error("Failed to send shipped email:", err)
      );
    } else if (status === "delivered") {
      sendOrderDelivered(order._id).catch((err) =>
        console.error("Failed to send delivered email:", err)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Order status updated",
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update order status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Mark order as paid (Admin - for bank transfers)
// @route   PUT /api/orders/:id/mark-paid
// @access  Private/Admin
export const markOrderAsPaid = async (req, res) => {
  try {
    const { transactionId, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        status: "error",
        message: "Order is already marked as paid",
      });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: transactionId || `MANUAL-${Date.now()}`,
      status: "completed",
      updateTime: new Date().toISOString(),
      emailAddress: req.user.email,
      gateway: order.paymentMethod,
    };

    if (notes) {
      order.notes = notes;
    }

    await order.save();

    // Send order confirmation email
    const { sendOrderConfirmation } = await import(
      "./notificationController.js"
    );
    sendOrderConfirmation(order._id).catch((err) =>
      console.error("Failed to send order confirmation:", err)
    );

    res.status(200).json({
      status: "success",
      message: "Order marked as paid successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Mark order as paid error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to mark order as paid",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to cancel this order",
      });
    }

    // Can only cancel pending or processing orders
    if (!["pending", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        status: "error",
        message: "Cannot cancel order in current status",
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: item.quantity },
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const deliveredOrders = await Order.countDocuments({ isDelivered: true });

    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $count: {} } } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalOrders,
        paidOrders,
        deliveredOrders,
        revenue,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch order statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
