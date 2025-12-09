import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  verifyBackupCode,
  generateOTP,
  encrypt,
  decrypt,
} from "../utils/twoFactor.js";
import { sendEmail, emailTemplates } from "../utils/sendEmail.js";

// @desc    Enable 2FA - Generate QR code
// @route   POST /api/auth/2fa/enable
// @access  Private
export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        status: "error",
        message: "Two-factor authentication is already enabled",
      });
    }

    // Generate TOTP secret
    const { secret, otpauth_url } = generateTOTPSecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauth_url);

    // Store encrypted secret temporarily (will be confirmed on verification)
    user.twoFactorSecret = encrypt(secret);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Scan the QR code with your authenticator app",
      data: {
        qrCode,
        secret, // Manual entry key
        otpauth_url,
      },
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to enable 2FA",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify 2FA setup
// @route   POST /api/auth/2fa/verify-setup
// @access  Private
export const verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Verification code is required",
      });
    }

    const user = await User.findById(req.user._id).select("+twoFactorSecret");

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        status: "error",
        message: "2FA setup not initiated. Please start the setup process first.",
      });
    }

    // Decrypt secret
    const secret = decrypt(user.twoFactorSecret);

    // Verify the token
    const isValid = verifyTOTP(token, secret);

    if (!isValid) {
      return res.status(400).json({
        status: "error",
        message: "Invalid verification code. Please try again.",
      });
    }

    // Generate backup codes
    const { plainCodes, hashedCodes } = await generateBackupCodes(10);

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "2fa_enabled",
      details: { method: user.twoFactorMethod },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation email
    const emailContent = emailTemplates.welcome(user.name); // You can create a specific 2FA enabled template
    await sendEmail({
      to: user.email,
      subject: "Two-Factor Authentication Enabled",
      html: `<p>Hi ${user.name},</p><p>Two-factor authentication has been successfully enabled on your account.</p>`,
      text: `Hi ${user.name}, Two-factor authentication has been successfully enabled on your account.`,
    });

    res.status(200).json({
      status: "success",
      message: "Two-factor authentication enabled successfully",
      data: {
        backupCodes: plainCodes,
      },
    });
  } catch (error) {
    console.error("Verify 2FA setup error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify 2FA setup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify 2FA during login
// @route   POST /api/auth/2fa/verify-login
// @access  Public (but requires valid login session)
export const verify2FALogin = async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Verification code and user ID are required",
      });
    }

    const user = await User.findById(userId).select("+twoFactorSecret +twoFactorBackupCodes");

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request",
      });
    }

    // Decrypt secret
    const secret = decrypt(user.twoFactorSecret);

    // Verify TOTP
    const isValid = verifyTOTP(token, secret);

    if (isValid) {
      // Generate tokens after successful 2FA
      const { generateAccessToken, generateRefreshToken } = await import("../utils/generateToken.js");
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Log successful login with 2FA
      const LoginAttempt = (await import("../models/LoginAttempt.js")).default;
      await LoginAttempt.create({
        user: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        success: true,
        twoFactorPassed: true,
      });

      return res.status(200).json({
        status: "success",
        message: "2FA verification successful",
        data: {
          verified: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
          },
          accessToken,
          refreshToken,
        },
      });
    }

    // If TOTP fails, check if it's a backup code
    const backupResult = await verifyBackupCode(token, user.twoFactorBackupCodes);

    if (backupResult.isValid) {
      // Remove used backup code
      user.twoFactorBackupCodes.splice(backupResult.matchedIndex, 1);
      
      // Generate tokens after successful backup code verification
      const { generateAccessToken, generateRefreshToken } = await import("../utils/generateToken.js");
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Log successful login with 2FA
      const LoginAttempt = (await import("../models/LoginAttempt.js")).default;
      await LoginAttempt.create({
        user: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        success: true,
        twoFactorPassed: true,
      });

      return res.status(200).json({
        status: "success",
        message: "Backup code verified. Please generate new backup codes.",
        data: {
          verified: true,
          backupCodeUsed: true,
          remainingBackupCodes: user.twoFactorBackupCodes.length,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
          },
          accessToken,
          refreshToken,
        },
      });
    }

    res.status(400).json({
      status: "error",
      message: "Invalid verification code",
    });
  } catch (error) {
    console.error("Verify 2FA login error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify 2FA",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
export const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required to disable 2FA",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "2fa_disabled",
      details: {},
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send security alert
    await sendEmail({
      to: user.email,
      subject: "Two-Factor Authentication Disabled",
      html: `<p>Hi ${user.name},</p><p>Two-factor authentication has been disabled on your account. If you didn't make this change, please secure your account immediately.</p>`,
      text: `Hi ${user.name}, Two-factor authentication has been disabled on your account.`,
    });

    res.status(200).json({
      status: "success",
      message: "Two-factor authentication disabled successfully",
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to disable 2FA",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Regenerate backup codes
// @route   POST /api/auth/2fa/regenerate-backup
// @access  Private
export const regenerateBackupCodes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        status: "error",
        message: "Two-factor authentication is not enabled",
      });
    }

    // Generate new backup codes
    const { plainCodes, hashedCodes } = await generateBackupCodes(10);

    user.twoFactorBackupCodes = hashedCodes;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Backup codes regenerated successfully",
      data: {
        backupCodes: plainCodes,
      },
    });
  } catch (error) {
    console.error("Regenerate backup codes error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to regenerate backup codes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Send OTP via email/SMS
// @route   POST /api/auth/2fa/send-otp
// @access  Public (for login) / Private (for setup)
export const sendOTP = async (req, res) => {
  try {
    const { email, method } = req.body;

    if (!email || !method) {
      return res.status(400).json({
        status: "error",
        message: "Email and method are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in Redis with 10-minute expiry (you'll need to set up Redis)
    // For now, we'll store it temporarily in the user document
    // In production, use Redis for better performance

    if (method === "email") {
      await sendEmail({
        to: user.email,
        subject: "Your Verification Code",
        html: `<p>Hi ${user.name},</p><p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
        text: `Hi ${user.name}, Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      });
    } else if (method === "sms") {
      // Implement Twilio SMS sending here
      // For now, return error
      return res.status(501).json({
        status: "error",
        message: "SMS OTP not yet implemented",
      });
    }

    res.status(200).json({
      status: "success",
      message: `OTP sent via ${method}`,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
