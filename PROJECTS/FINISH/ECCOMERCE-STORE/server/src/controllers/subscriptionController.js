import Subscription from '../models/Subscription.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Initialize subscription payment
// @route   POST /api/subscriptions/initialize-payment
// @access  Private
export const initializeSubscriptionPayment = async (req, res) => {
  try {
    const { productId, frequency, deliveryAddress, quantity = 1, gateway, currency = 'USD' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    if (!gateway) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment gateway is required',
      });
    }

    // Calculate subscription price (with 10% discount)
    const subscriptionPrice = product.price * quantity * 0.9;

    // Import payment factory
    const { initializePayment } = await import('../config/payments/paymentFactory.js');

    // Prepare payment data
    const paymentData = {
      amount: subscriptionPrice,
      currency,
      email: req.user.email,
      name: req.user.name,
      reference: `SUB-${req.user._id}-${Date.now()}`,
      redirectUrl: `${process.env.CLIENT_URL}/subscriptions?payment=success`,
      callbackUrl: `${process.env.CLIENT_URL}/subscriptions?payment=success`,
      metadata: {
        userId: req.user._id.toString(),
        productId: productId.toString(),
        type: 'subscription',
        frequency,
        quantity,
        deliveryAddress: JSON.stringify(deliveryAddress),
      },
      title: `Subscription - ${product.name}`,
      description: `${frequency} subscription for ${product.name}`,
    };

    // Initialize payment
    const result = await initializePayment(gateway, paymentData);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Payment initialization failed',
      });
    }

    // Normalize response - provide consistent field names
    const responseData = {
      gateway,
      reference: paymentData.reference,
      ...result,
    };

    // Add normalized paymentUrl field for easier frontend handling
    if (result.authorizationUrl) {
      responseData.paymentUrl = result.authorizationUrl;
    } else if (result.paymentLink) {
      responseData.paymentUrl = result.paymentLink;
    } else if (result.link) {
      responseData.paymentUrl = result.link;
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment initialized successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Initialize subscription payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize payment',
    });
  }
};

// @desc    Verify subscription payment and create subscription
// @route   POST /api/subscriptions/verify-payment
// @access  Private
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { reference, gateway } = req.body;

    if (!reference || !gateway) {
      return res.status(400).json({
        status: 'error',
        message: 'Reference and gateway are required',
      });
    }

    console.log(`Verifying ${gateway} subscription payment with reference: ${reference}`);

    // Import payment factory
    const { verifyPayment } = await import('../config/payments/paymentFactory.js');

    // Verify payment
    const result = await verifyPayment(gateway, reference);

    console.log('Subscription payment verification result:', result);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Payment verification failed',
      });
    }

    // Check if subscription already exists for this payment
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      'metadata.paymentReference': reference,
    });

    if (existingSubscription) {
      console.log('Subscription already created for payment:', reference);
      await existingSubscription.populate('product', 'name price images');
      return res.status(200).json({
        status: 'success',
        message: 'Subscription already created',
        data: { subscription: existingSubscription },
      });
    }

    // Extract metadata
    const { productId, frequency, quantity, deliveryAddress } = result.metadata;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Calculate next delivery date
    const now = new Date();
    let nextDelivery;
    switch(frequency) {
      case 'weekly':
        nextDelivery = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'biweekly':
        nextDelivery = new Date(now.setDate(now.getDate() + 14));
        break;
      case 'monthly':
        nextDelivery = new Date(now.setMonth(now.getMonth() + 1));
        break;
      default:
        nextDelivery = new Date(now.setMonth(now.getMonth() + 1));
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      product: productId,
      frequency,
      nextDelivery,
      deliveryAddress: typeof deliveryAddress === 'string' ? JSON.parse(deliveryAddress) : deliveryAddress,
      quantity: parseInt(quantity) || 1,
      price: product.price,
      discount: 10, // 10% subscription discount
    });

    await subscription.populate('product', 'name price images');

    res.status(201).json({
      status: 'success',
      message: 'Payment verified and subscription created successfully',
      data: { subscription },
    });
  } catch (error) {
    console.error('Verify subscription payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify payment and create subscription',
    });
  }
};

// @desc    Create subscription (Direct - for testing)
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res) => {
  try {
    const { productId, frequency, deliveryAddress, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Calculate next delivery date
    const now = new Date();
    let nextDelivery;
    switch(frequency) {
      case 'weekly':
        nextDelivery = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'biweekly':
        nextDelivery = new Date(now.setDate(now.getDate() + 14));
        break;
      case 'monthly':
        nextDelivery = new Date(now.setMonth(now.getMonth() + 1));
        break;
      default:
        nextDelivery = new Date(now.setMonth(now.getMonth() + 1));
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      product: productId,
      frequency,
      nextDelivery,
      deliveryAddress,
      quantity,
      price: product.price,
    });

    await subscription.populate('product', 'name price images');

    res.status(201).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create subscription',
    });
  }
};

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('product', 'name price images')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { subscriptions },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscriptions',
    });
  }
};

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('product', 'name price images');

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found',
      });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription',
    });
  }
};

// @desc    Pause subscription
// @route   PUT /api/subscriptions/:id/pause
// @access  Private
export const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found',
      });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    subscription.status = 'paused';
    await subscription.save();

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to pause subscription',
    });
  }
};

// @desc    Resume subscription
// @route   PUT /api/subscriptions/:id/resume
// @access  Private
export const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found',
      });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    subscription.status = 'active';
    subscription.nextDelivery = subscription.calculateNextDelivery();
    await subscription.save();

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resume subscription',
    });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found',
      });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel subscription',
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
export const updateSubscription = async (req, res) => {
  try {
    const { frequency, deliveryAddress, quantity } = req.body;
    
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found',
      });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    if (frequency) subscription.frequency = frequency;
    if (deliveryAddress) subscription.deliveryAddress = deliveryAddress;
    if (quantity) subscription.quantity = quantity;

    await subscription.save();

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update subscription',
    });
  }
};

// @desc    Process subscriptions (Manual trigger)
// @route   POST /api/subscriptions/process
// @access  Private/Admin
export const processSubscriptions = async (req, res) => {
  try {
    const subscriptionProcessor = (await import('../services/subscriptionProcessor.js')).default;
    
    const results = await subscriptionProcessor.processDueSubscriptions();

    res.status(200).json({
      status: 'success',
      message: `Processed ${results.successful} subscriptions successfully, ${results.failed} failed`,
      data: results,
    });
  } catch (error) {
    console.error('Process subscriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get subscription analytics
// @route   GET /api/subscriptions/analytics
// @access  Private/Admin
export const getSubscriptionAnalytics = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const pausedSubscriptions = await Subscription.countDocuments({ status: 'paused' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });

    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubsWithRevenue = await Subscription.find({ status: 'active' });
    let monthlyRevenue = 0;
    
    activeSubsWithRevenue.forEach(sub => {
      const discountedPrice = sub.price * (1 - sub.discount / 100) * sub.quantity;
      if (sub.frequency === 'weekly') {
        monthlyRevenue += discountedPrice * 4;
      } else if (sub.frequency === 'biweekly') {
        monthlyRevenue += discountedPrice * 2;
      } else {
        monthlyRevenue += discountedPrice;
      }
    });

    // Get upcoming deliveries
    const upcomingDeliveries = await Subscription.find({
      status: 'active',
      nextDelivery: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
    }).countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        paused: pausedSubscriptions,
        cancelled: cancelledSubscriptions,
        monthlyRecurringRevenue: monthlyRevenue,
        upcomingDeliveriesThisWeek: upcomingDeliveries,
      },
    });
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics',
    });
  }
};
