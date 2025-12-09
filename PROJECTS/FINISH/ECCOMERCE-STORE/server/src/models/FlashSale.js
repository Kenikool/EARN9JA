import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
flashSaleSchema.index({ startTime: 1, endTime: 1 });
flashSaleSchema.index({ isActive: 1 });

// Check if flash sale is currently active
flashSaleSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.startTime <= now && 
         this.endTime >= now &&
         this.soldCount < this.quantity;
};

export default mongoose.model('FlashSale', flashSaleSchema);
