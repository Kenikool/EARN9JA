import mongoose, { Schema, Document } from "mongoose";

export interface IAppVersion extends Document {
  platform: "android" | "ios";

  // Version Info
  latestVersion: string; // e.g., "1.2.3"
  minVersion: string; // e.g., "1.0.0"

  // Download URLs
  downloadUrl: string; // APK URL for Android, App Store URL for iOS

  // Release Notes
  releaseNotes: string[]; // Array of bullet points
  releaseDate: Date;

  // Update Behavior
  updateRequired: boolean; // Force update if below minVersion

  // Metadata
  publishedBy: mongoose.Types.ObjectId;
  publishedAt: Date;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const appVersionSchema = new Schema<IAppVersion>(
  {
    platform: {
      type: String,
      enum: ["android", "ios"],
      required: true,
    },
    latestVersion: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Validate semantic versioning format (e.g., 1.2.3)
          return /^\d+\.\d+\.\d+$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid semantic version format (e.g., 1.2.3)`,
      },
    },
    minVersion: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Validate semantic versioning format
          return /^\d+\.\d+\.\d+$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid semantic version format (e.g., 1.2.3)`,
      },
    },
    downloadUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Validate HTTPS URL
          return /^https:\/\/.+/.test(v);
        },
        message: "Download URL must be a valid HTTPS URL",
      },
    },
    releaseNotes: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length > 0 && v.length <= 10;
        },
        message: "Release notes must have 1-10 bullet points",
      },
    },
    releaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updateRequired: {
      type: Boolean,
      required: true,
      default: false,
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
appVersionSchema.index({ platform: 1, isActive: 1 });
appVersionSchema.index({ platform: 1, latestVersion: 1 });

// Validate that minVersion is not greater than latestVersion
appVersionSchema.pre("save", function (next) {
  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] < parts2[i]) return -1;
      if (parts1[i] > parts2[i]) return 1;
    }
    return 0;
  };

  if (compareVersions(this.minVersion, this.latestVersion) > 0) {
    next(new Error("Minimum version cannot be greater than latest version"));
  } else {
    next();
  }
});

export const AppVersion = mongoose.model<IAppVersion>(
  "AppVersion",
  appVersionSchema
);
