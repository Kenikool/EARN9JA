import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { generateEmailToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// @desc    Request email change
// @route   POST /api/auth/email/change-request
// @access  Private
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        status: "error",
        message: "New email and password are required",
      });
    }

    // Check if new email is same as current
    if (newEmail.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({
        status: "error",
        message: "New email must be different from current email",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      });
    }

    // Verify password
    const bcrypt = await import("bcryptjs");
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Generate tokens
    const oldEmailToken = generateEmailToken();
    const newEmailToken = generateEmailToken();

    // Store pending email change
    user.pendingEmail = newEmail.toLowerCase();
    user.emailChangeToken = crypto.createHash("sha256").update(oldEmailToken + newEmailToken).digest("hex");
    user.emailChangeExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    user.oldEmailVerified = false;
    await user.save();

    // Send verification to old email first
    const oldEmailLink = `${process.env.CLIENT_URL}/verify-email-change/old?token=${oldEmailToken}`;
    await sendEmail({
      to: user.email,
      subject: "Confirm Email Change Request",
      type: "security",
      userId: user._id,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Change Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to change your email address to <strong>${newEmail}</strong>.</p>
          <p>To proceed, please verify this request by clicking the button below:</p>
          <p>
            <a href="${oldEmailLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Verify Email Change
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this change, please ignore this email and secure your account.</p>
        </div>
      `,
      text: `Verify email change: ${oldEmailLink}`,
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "email_change_requested",
      details: { oldEmail: user.email, newEmail },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      status: "success",
      message: "Verification email sent to your current email address",
    });
  } catch (error) {
    console.error("Request email change error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to request email change",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify old email
// @route   GET /api/auth/email/verify-old/:token
// @access  Public
export const verifyOldEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailChangeExpires: { $gt: Date.now() },
      pendingEmail: { $exists: true, $ne: null },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired token",
      });
    }

    // Mark old email as verified
    user.oldEmailVerified = true;
    await user.save();

    // Generate new email token
    const newEmailToken = generateEmailToken();
    const newEmailLink = `${process.env.CLIENT_URL}/verify-email-change/new?token=${newEmailToken}&userId=${user._id}`;

    // Send verification to new email
    await sendEmail({
      to: user.pendingEmail,
      subject: "Verify Your New Email Address",
      type: "security",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify New Email Address</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify this email address to complete your email change:</p>
          <p>
            <a href="${newEmailLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Verify New Email
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
      text: `Verify new email: ${newEmailLink}`,
    });

    res.status(200).json({
      status: "success",
      message: "Old email verified. Check your new email for verification link.",
    });
  } catch (error) {
    console.error("Verify old email error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify old email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify new email and complete change
// @route   GET /api/auth/email/verify-new/:token
// @access  Public
export const verifyNewEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.query;

    const user = await User.findById(userId);

    if (!user || !user.pendingEmail || !user.oldEmailVerified) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request or old email not verified",
      });
    }

    if (user.emailChangeExpires < Date.now()) {
      return res.status(400).json({
        status: "error",
        message: "Email change request has expired",
      });
    }

    const oldEmail = user.email;
    const newEmail = user.pendingEmail;

    // Update email
    user.email = newEmail;
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;
    user.oldEmailVerified = false;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "email_changed",
      details: { oldEmail, newEmail },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation to both emails
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Changed Successfully</h2>
        <p>Hi ${user.name},</p>
        <p>Your email address has been changed successfully.</p>
        <p><strong>Old Email:</strong> ${oldEmail}</p>
        <p><strong>New Email:</strong> ${newEmail}</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      </div>
    `;

    await sendEmail({
      to: oldEmail,
      subject: "Email Address Changed",
      type: "security",
      html: confirmationHtml,
      text: `Your email has been changed from ${oldEmail} to ${newEmail}`,
    });

    await sendEmail({
      to: newEmail,
      subject: "Email Address Changed",
      type: "security",
      userId: user._id,
      html: confirmationHtml,
      text: `Your email has been changed from ${oldEmail} to ${newEmail}`,
    });

    res.status(200).json({
      status: "success",
      message: "Email changed successfully",
    });
  } catch (error) {
    console.error("Verify new email error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify new email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  requestEmailChange,
  verifyOldEmail,
  verifyNewEmail,
};
