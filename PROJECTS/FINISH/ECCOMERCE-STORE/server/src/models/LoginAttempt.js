import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: [Number],
    },
    success: {
      type: Boolean,
      required: true,
      index: true,
    },
    failureReason: String,
    twoFactorPassed: Boolean,
    flaggedAsSuspicious: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspiciousReasons: [String],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
loginAttemptSchema.index({ user: 1, timestamp: -1 });
loginAttemptSchema.index({ email: 1, timestamp: -1 });
loginAttemptSchema.index({ ipAddress: 1, timestamp: -1 });

// Auto-delete old login attempts after 90 days
loginAttemptSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);

export default LoginAttempt;
