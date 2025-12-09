import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import LoginAttempt from "../models/LoginAttempt.js";
import { generateEmailToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { unlockAccount } from "../utils/accountSecurity.js";

// @desc    Request account unlock
// @route   POST /api/auth/unlock-account
// @access  Public
export const requestAccountUnlock = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        status: "success",
        message: "If your account is locked, an unlock link has been sent to your email",
      });
    }

    // Check if account is actually locked
    if (!user.accountLockedUntil || new Date() > user.accountLockedUntil) {
      return res.status(200).json({
        status: "success",
        message: "If your account is locked, an unlock link has been sent to your email",
      });
    }

    // Generate unlock token
    const unlockToken = generateEmailToken();
    user.passwordResetToken = unlockToken; // Reuse this field for unlock
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send unlock email
    const unlockLink = `${process.env.CLIENT_URL}/unlock-account?token=${unlockToken}`;
    await sendEmail({
      to: user.email,
      subject: "Unlock Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Unlock Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to unlock your account. Click the button below to unlock it:</p>
          <a href="${unlockLink}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Unlock Account
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Hi ${user.name}, Click this link to unlock your account: ${unlockLink}`,
    });

    res.status(200).json({
      status: "success",
      message: "If your account is locked, an unlock link has been sent to your email",
    });
  } catch (error) {
    console.error("Request unlock error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process unlock request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify unlock token and unlock account
// @route   GET /api/auth/unlock-account/:token
// @access  Public
export const verifyUnlockToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired unlock token",
      });
    }

    // Unlock account
    await unlockAccount(user);

    // Clear token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_unlocked",
      details: { method: "email_verification" },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      status: "success",
      message: "Account unlocked successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify unlock token error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to unlock account",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get login history
// @route   GET /api/auth/login-history
// @access  Private
export const getLoginHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const loginAttempts = await LoginAttempt.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await LoginAttempt.countDocuments({ user: req.user._id });

    res.status(200).json({
      status: "success",
      data: {
        loginAttempts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch login history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get activity log
// @route   GET /api/auth/activity-log
// @access  Private
export const getActivityLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action; // Optional filter by action type

    const query = { user: req.user._id };
    if (action) {
      query.action = action;
    }

    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get activity log error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch activity log",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get security status overview
// @route   GET /api/auth/security-status
// @access  Private
export const getSecurityStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get recent login attempts
    const recentAttempts = await LoginAttempt.find({ user: user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    // Count failed attempts in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFailedAttempts = await LoginAttempt.countDocuments({
      user: user._id,
      success: false,
      timestamp: { $gte: oneDayAgo },
    });

    // Check for suspicious activity
    const suspiciousAttempts = await LoginAttempt.countDocuments({
      user: user._id,
      flaggedAsSuspicious: true,
      timestamp: { $gte: oneDayAgo },
    });

    res.status(200).json({
      status: "success",
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
        accountLocked: user.accountLockedUntil && new Date() < user.accountLockedUntil,
        failedLoginAttempts: user.failedLoginAttempts,
        recentFailedAttempts,
        suspiciousAttempts,
        lastLogin: user.lastLogin,
        passwordChangedAt: user.passwordChangedAt,
        recentAttempts: recentAttempts.slice(0, 5), // Last 5 attempts
      },
    });
  } catch (error) {
    console.error("Get security status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch security status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// @desc    Change password
// @route   POST /api/auth/security/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "New password must be at least 8 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password +passwordHistory");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Verify current password
    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Check if new password is same as current
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        status: "error",
        message: "New password must be different from current password",
      });
    }

    // Check password history
    const { isPasswordInHistory, addPasswordToHistory, setPasswordExpiry, clearForcePasswordChange } = await import("../utils/passwordSecurity.js");
    
    const isInHistory = await isPasswordInHistory(user, newPassword);
    if (isInHistory) {
      return res.status(400).json({
        status: "error",
        message: "You cannot reuse any of your last 5 passwords",
      });
    }

    // Add current password to history before changing
    await addPasswordToHistory(user, user.password);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    setPasswordExpiry(user, 90); // Set expiry to 90 days
    
    // Clear force password change flag if set
    if (user.forcePasswordChange) {
      await clearForcePasswordChange(user);
    }

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "password_changed",
      details: { method: "manual" },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been changed successfully.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${req.ip}</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p>Best regards,<br>The Security Team</p>
        </div>
      `,
      text: `Hi ${user.name}, Your password has been changed successfully at ${new Date().toLocaleString()}.`,
    });

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
