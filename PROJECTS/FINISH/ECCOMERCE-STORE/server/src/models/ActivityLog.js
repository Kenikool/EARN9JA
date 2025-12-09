import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "password_change",
        "email_change",
        "2fa_enabled",
        "2fa_disabled",
        "profile_update",
        "session_revoked",
        "account_deactivated",
        "account_reactivated",
        "account_deletion_scheduled",
        "account_deletion_cancelled",
        "data_export_requested",
        "trusted_device_added",
        "trusted_device_removed",
        "social_login",
        "account_linked",
        "account_unlinked",
      ],
    },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
