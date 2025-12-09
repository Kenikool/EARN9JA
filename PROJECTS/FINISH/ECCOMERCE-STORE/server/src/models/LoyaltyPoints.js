import mongoose from 'mongoose';

const loyaltyPointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  },
  transactions: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Calculate tier based on points
loyaltyPointsSchema.methods.updateTier = function() {
  if (this.points >= 10000) {
    this.tier = 'platinum';
  } else if (this.points >= 5000) {
    this.tier = 'gold';
  } else if (this.points >= 1000) {
    this.tier = 'silver';
  } else {
    this.tier = 'bronze';
  }
};

// Add points
loyaltyPointsSchema.methods.addPoints = function(points, reason) {
  this.points += points;
  this.transactions.push({
    type: 'earned',
    points,
    reason,
  });
  this.updateTier();
};

// Redeem points
loyaltyPointsSchema.methods.redeemPoints = function(points, reason) {
  if (this.points < points) {
    throw new Error('Insufficient points');
  }
  this.points -= points;
  this.transactions.push({
    type: 'redeemed',
    points,
    reason,
  });
  this.updateTier();
};

// Index for faster lookups
loyaltyPointsSchema.index({ user: 1 });

export default mongoose.model('LoyaltyPoints', loyaltyPointsSchema);
