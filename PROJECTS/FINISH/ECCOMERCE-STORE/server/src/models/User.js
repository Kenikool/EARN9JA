import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    addresses: [addressSchema],
    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,

    // Two-Factor Authentication Fields
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false, // Don't return by default
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false, // Don't return by default
    },
    twoFactorMethod: {
      type: String,
      enum: ["authenticator", "email", "sms"],
      default: "authenticator",
    },
    phoneNumber: String,
    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // Account Security Fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: Date,

    // User Preferences
    preferredCurrency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'ZAR', 'CAD', 'AUD'],
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'fr', 'es', 'ar'],
    },
    passwordHistory: [
      {
        password: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    passwordChangedAt: Date,
    passwordExpiresAt: Date,
    forcePasswordChange: {
      type: Boolean,
      default: false,
    },

    // Privacy & GDPR Fields
    privacySettings: {
      marketingEmails: {
        type: Boolean,
        default: true,
      },
      securityAlerts: {
        type: Boolean,
        default: true,
      },
      dataSharing: {
        type: Boolean,
        default: false,
      },
    },
    accountStatus: {
      type: String,
      enum: ["active", "deactivated", "scheduled_deletion"],
      default: "active",
    },
    deletionScheduledFor: Date,

    // Social Authentication Fields
    clerkUserId: String,
    googleId: String,
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Email Change Fields
    pendingEmail: String,
    emailChangeToken: String,
    emailChangeExpires: Date,
    oldEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const User = mongoose.model("User", userSchema);

export default User;
