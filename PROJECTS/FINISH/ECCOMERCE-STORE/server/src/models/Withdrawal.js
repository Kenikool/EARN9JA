import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
    country: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  reference: {
    type: String,
    unique: true,
  },
  gatewayReference: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  processedAt: Date,
  failureReason: String,
}, {
  timestamps: true,
});

export default mongoose.model('Withdrawal', withdrawalSchema);
