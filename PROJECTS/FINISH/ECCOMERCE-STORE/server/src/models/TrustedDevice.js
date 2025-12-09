import mongoose from "mongoose";

const trustedDeviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
      index: true,
    },
    deviceInfo: {
      userAgent: String,
      browser: String,
      os: String,
      device: String,
    },
    ipAddress: String,
    trustedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
trustedDeviceSchema.index({ user: 1, deviceFingerprint: 1 }, { unique: true });
trustedDeviceSchema.index({ user: 1, isActive: 1 });

// Auto-delete expired trusted devices
trustedDeviceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TrustedDevice = mongoose.model("TrustedDevice", trustedDeviceSchema);

export default TrustedDevice;
