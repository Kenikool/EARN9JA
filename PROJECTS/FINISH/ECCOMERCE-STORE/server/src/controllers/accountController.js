import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import {
  deactivateAccount,
  reactivateAccount,
  scheduleAccountDeletion,
  cancelAccountDeletion,
  sendDeactivationEmail,
  sendDeletionScheduledEmail,
  sendDeletionCancelledEmail,
} from "../utils/accountManagement.js";

// @desc    Deactivate account
// @route   POST /api/auth/account/deactivate
// @access  Private
export const deactivateUserAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required to deactivate account",
      });
    }

    // Verify password
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Deactivate account
    const result = await deactivateAccount(user._id);

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_deactivated",
      details: {},
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation email
    await sendDeactivationEmail(user);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to deactivate account",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Reactivate account
// @route   POST /api/auth/account/reactivate
// @access  Public (with valid credentials)
export const reactivateUserAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if account is deactivated
    if (user.accountStatus !== "deactivated") {
      return res.status(400).json({
        status: "error",
        message: "Account is not deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Reactivate account
    const result = await reactivateAccount(user._id);

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_reactivated",
      details: {},
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("Reactivate account error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reactivate account",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Schedule account deletion
// @route   POST /api/auth/account/delete
// @access  Private
export const scheduleUserAccountDeletion = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required to delete account",
      });
    }

    if (confirmation !== "DELETE") {
      return res.status(400).json({
        status: "error",
        message: 'Please type "DELETE" to confirm account deletion',
      });
    }

    // Verify password
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Schedule deletion
    const result = await scheduleAccountDeletion(user._id, 30);

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_deletion_scheduled",
      details: { deletionDate: result.deletionDate },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation email
    await sendDeletionScheduledEmail(user, result.deletionDate);

    res.status(200).json({
      status: "success",
      message: result.message,
      data: {
        deletionDate: result.deletionDate,
      },
    });
  } catch (error) {
    console.error("Schedule account deletion error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to schedule account deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Cancel account deletion
// @route   POST /api/auth/account/cancel-deletion
// @access  Private
export const cancelUserAccountDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.accountStatus !== "scheduled_deletion") {
      return res.status(400).json({
        status: "error",
        message: "Account is not scheduled for deletion",
      });
    }

    // Cancel deletion
    const result = await cancelAccountDeletion(user._id);

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_deletion_cancelled",
      details: {},
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation email
    await sendDeletionCancelledEmail(user);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("Cancel account deletion error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to cancel account deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get account status
// @route   GET /api/auth/account/status
// @access  Private
export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: "success",
      data: {
        accountStatus: user.accountStatus,
        deletionScheduledFor: user.deletionScheduledFor,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        passwordExpiresAt: user.passwordExpiresAt,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error) {
    console.error("Get account status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get account status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  deactivateUserAccount,
  reactivateUserAccount,
  scheduleUserAccountDeletion,
  cancelUserAccountDeletion,
  getAccountStatus,
};
