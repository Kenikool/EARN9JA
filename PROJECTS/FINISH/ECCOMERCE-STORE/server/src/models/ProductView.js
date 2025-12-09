import mongoose from "mongoose";

const productViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productViewSchema.index({ user: 1, product: 1 });
productViewSchema.index({ product: 1, timestamp: -1 });
productViewSchema.index({ timestamp: -1 });

const ProductView = mongoose.model("ProductView", productViewSchema);

export default ProductView;
