import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true,
  },
  nextDelivery: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
  },
  deliveryAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 10, // 10% discount for subscriptions
  },
  paymentMethod: {
    gateway: String,
    currency: String,
  },
  lastDelivery: Date,
  deliveryHistory: [{
    orderNumber: String,
    deliveryDate: Date,
    amount: Number,
    status: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  }],
  failedAttempts: {
    type: Number,
    default: 0,
  },
  lastFailureReason: String,
  cancelledAt: Date,
  cancelReason: String,
}, {
  timestamps: true,
});

// Calculate next delivery date based on frequency
subscriptionSchema.methods.calculateNextDelivery = function() {
  const now = new Date();
  switch(this.frequency) {
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'biweekly':
      return new Date(now.setDate(now.getDate() + 14));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
};

// Record successful delivery
subscriptionSchema.methods.recordDelivery = function(order) {
  this.deliveryHistory.push({
    orderNumber: order.orderNumber,
    deliveryDate: new Date(),
    amount: order.totalPrice,
    status: 'completed',
    orderId: order._id,
  });
  this.lastDelivery = new Date();
  this.failedAttempts = 0;
  this.lastFailureReason = null;
  return this.save();
};

// Record failed delivery attempt
subscriptionSchema.methods.recordFailure = function(reason) {
  this.failedAttempts += 1;
  this.lastFailureReason = reason;
  
  // Cancel subscription after 3 failed attempts
  if (this.failedAttempts >= 3) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancelReason = `Cancelled after ${this.failedAttempts} failed payment attempts`;
  }
  
  return this.save();
};

export default mongoose.model('Subscription', subscriptionSchema);
