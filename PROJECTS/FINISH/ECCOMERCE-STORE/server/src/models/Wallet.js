import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  transactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    reference: String,
    balanceAfter: Number,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Method to add funds
walletSchema.methods.addFunds = function(amount, description, reference) {
  this.balance += amount;
  this.transactions.push({
    type: 'credit',
    amount,
    description,
    reference,
    balanceAfter: this.balance,
  });
  return this.save();
};

// Method to deduct funds
walletSchema.methods.deductFunds = function(amount, description, reference) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  this.transactions.push({
    type: 'debit',
    amount,
    description,
    reference,
    balanceAfter: this.balance,
  });
  return this.save();
};

export default mongoose.model('Wallet', walletSchema);
