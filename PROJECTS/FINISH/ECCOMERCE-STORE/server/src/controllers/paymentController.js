import {
  initializePayment,
  verifyPayment,
  getAvailableGateways,
  getAllSupportedCurrencies,
} from "../config/payments/paymentFactory.js";
import Order from "../models/Order.js";
import stripe from "../config/payments/stripe.js";

// @desc    Initialize payment
// @route   POST /api/payment/initialize
// @access  Private
export const initializePaymentHandler = async (req, res) => {
  try {
    const { orderId, gateway, currency, paymentMethod } = req.body;

    // Validation
    if (!orderId || !gateway || !currency) {
      return res.status(400).json({
        status: "error",
        message: "Order ID, gateway, and currency are required",
      });
    }

    // Validate gateway
    const validGateways = ['stripe', 'flutterwave', 'paystack'];
    if (!validGateways.includes(gateway)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment gateway",
      });
    }

    // Validate currency format (3-letter ISO code)
    if (currency.length !== 3) {
      return res.status(400).json({
        status: "error",
        message: "Invalid currency code",
      });
    }

    // Validate currency is supported by selected gateway
    const availableGateways = getAvailableGateways(currency);
    if (!availableGateways.includes(gateway)) {
      return res.status(400).json({
        status: "error",
        message: `${gateway} does not support ${currency} currency`,
      });
    }

    // Find order
    const order = await Order.findById(orderId);

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
        message: "Not authorized to access this order",
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        status: "error",
        message: "Order is already paid",
      });
    }

    // Use the converted amount if currency matches, otherwise use USD amount
    const paymentAmount = currency === order.currency && order.totalPriceInCurrency
      ? order.totalPriceInCurrency
      : order.totalPrice;

    // Prepare payment data
    const paymentData = {
      amount: paymentAmount,
      currency,
      email: req.user.email,
      name: req.user.name,
      reference: `${order.orderNumber}-${Date.now()}`,
      redirectUrl: `${process.env.CLIENT_URL}/order-success?orderId=${orderId}`,
      callbackUrl: `${process.env.CLIENT_URL}/order-success?orderId=${orderId}`,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: req.user._id.toString(),
        originalAmount: order.totalPrice,
        originalCurrency: 'USD',
        exchangeRate: order.exchangeRate || 1,
      },
      title: `Order ${order.orderNumber}`,
      description: `Payment for order ${order.orderNumber}`,
      paymentMethod, // Pass the specific payment method
    };

    // Initialize payment
    const result = await initializePayment(gateway, paymentData);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: result.error || "Payment initialization failed",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Payment initialized successfully",
      data: {
        gateway,
        ...result,
      },
    });
  } catch (error) {
    console.error("Initialize payment error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to initialize payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify/:reference
// @access  Private
export const verifyPaymentHandler = async (req, res) => {
  try {
    const { reference } = req.params;
    const { gateway } = req.body;

    if (!gateway) {
      return res.status(400).json({
        status: "error",
        message: "Payment gateway is required",
      });
    }

    // Verify payment
    const result = await verifyPayment(gateway, reference);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: result.error || "Payment verification failed",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      data: result,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook/stripe
// @access  Public
export const handleStripeWebhook = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        status: "error",
        message: "Stripe is not configured",
      });
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Update order
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            updateTime: new Date().toISOString(),
            emailAddress: paymentIntent.receipt_email,
            gateway: "stripe",
          };
          await order.save();
        }
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({
      status: "error",
      message: "Webhook processing failed",
    });
  }
};

// @desc    Handle Flutterwave webhook
// @route   POST /api/payment/webhook/flutterwave
// @access  Public
export const handleFlutterwaveWebhook = async (req, res) => {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      return res.status(401).json({
        status: "error",
        message: "Invalid signature",
      });
    }

    const payload = req.body;

    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const orderId = payload.data.meta.orderId;

      // Update order
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: payload.data.id.toString(),
          status: payload.data.status,
          updateTime: new Date().toISOString(),
          emailAddress: payload.data.customer.email,
          gateway: "flutterwave",
        };
        await order.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    res.status(500).json({
      status: "error",
      message: "Webhook processing failed",
    });
  }
};

// @desc    Handle Paystack webhook
// @route   POST /api/payment/webhook/paystack
// @access  Public
export const handlePaystackWebhook = async (req, res) => {
  try {
    const hash = req.headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Verify signature
    const crypto = await import("crypto");
    const expectedHash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== expectedHash) {
      return res.status(401).json({
        status: "error",
        message: "Invalid signature",
      });
    }

    const payload = req.body;

    if (payload.event === "charge.success") {
      const orderId = payload.data.metadata.orderId;

      // Update order
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: payload.data.id.toString(),
          status: payload.data.status,
          updateTime: new Date().toISOString(),
          emailAddress: payload.data.customer.email,
          gateway: "paystack",
        };
        await order.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    res.status(500).json({
      status: "error",
      message: "Webhook processing failed",
    });
  }
};

// @desc    Get available payment methods
// @route   GET /api/payment/methods
// @access  Public
export const getPaymentMethods = async (req, res) => {
  try {
    const { currency = "USD" } = req.query;

    const gateways = getAvailableGateways(currency);

    res.status(200).json({
      status: "success",
      data: {
        currency,
        gateways,
      },
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch payment methods",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get supported currencies
// @route   GET /api/payment/currencies
// @access  Public
export const getSupportedCurrencies = async (req, res) => {
  try {
    const currencies = getAllSupportedCurrencies();

    res.status(200).json({
      status: "success",
      data: { currencies },
    });
  } catch (error) {
    console.error("Get currencies error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch currencies",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
