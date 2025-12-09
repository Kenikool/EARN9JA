import mongoose from "mongoose";

const rateLimitViolationSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      required: true,
    },
    userAgent: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    requestCount: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    windowMs: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    blocked: {
      type: Boolean,
      default: true,
    },
    location: {
      country: String,
      city: String,
      region: String,
      timezone: String,
      coordinates: [Number],
    },
    isWhitelisted: {
      type: Boolean,
      default: false,
    },
    notes: String,
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);



// Virtual for calculating excess requests
rateLimitViolationSchema.virtual("excessRequests").get(function () {
  return this.requestCount - this.limit;
});

// Method to calculate severity based on excess requests
rateLimitViolationSchema.methods.calculateSeverity = function () {
  const excess = this.requestCount - this.limit;
  const excessPercentage = (excess / this.limit) * 100;

  if (excessPercentage >= 500) {
    return "critical";
  } else if (excessPercentage >= 200) {
    return "high";
  } else if (excessPercentage >= 50) {
    return "medium";
  } else {
    return "low";
  }
};

// Pre-save hook to auto-calculate severity
rateLimitViolationSchema.pre("save", function (next) {
  if (this.isNew && !this.severity) {
    this.severity = this.calculateSeverity();
  }
  next();
});

const RateLimitViolation = mongoose.model("RateLimitViolation", rateLimitViolationSchema);

export default RateLimitViolation;
