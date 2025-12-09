import mongoose from 'mongoose';

const productQuestionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: String,
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  answeredAt: Date,
  helpful: {
    type: Number,
    default: 0,
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['pending', 'answered'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Index for faster queries
productQuestionSchema.index({ product: 1, createdAt: -1 });
productQuestionSchema.index({ status: 1 });

export default mongoose.model('ProductQuestion', productQuestionSchema);
