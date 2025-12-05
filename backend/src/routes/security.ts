import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import { OTPService } from "../services/OTPService.js";

const router = express.Router();

// Send OTP for 2FA setup
router.post("/2fa/send-otp", auth, async (req, res) => {
  try {
    const { method } = req.body; // 'sms' or 'email'
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    // Check rate limiting (max 3 attempts per 15 minutes)
    if (
      user.otpAttempts >= 3 &&
      user.otpExpiry &&
      new Date() < user.otpExpiry
    ) {
      return res.status(429).json({
        message: "Too many attempts. Please try again later.",
      });
    }

    // Generate OTP
    const otp = OTPService.generateOTP();
    const expiry = OTPService.generateExpiry();

    // Send OTP based on method
    let sent = false;
    if (method === "sms") {
      if (!user.phone) {
        return res.status(400).json({ message: "Phone number not provided" });
      }
      sent = await OTPService.sendSMSOTP(user.phone, otp);
    } else if (method === "email") {
      sent = await OTPService.sendEmailOTP(user.email, otp);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid method. Use 'sms' or 'email'" });
    }

    if (!sent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    // Save OTP to user
    user.otpCode = otp;
    user.otpExpiry = expiry;
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await user.save();

    res.json({
      message: `OTP sent to your ${method}`,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Enable 2FA
router.post("/2fa/enable", auth, async (req, res) => {
  try {
    const { otp, method } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    // Verify OTP
    const isValid = OTPService.verifyOTP(otp, user.otpCode, user.otpExpiry);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorMethod = method;

    // Clear OTP data
    user.otpCode = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;

    // Mark phone as verified if SMS method
    if (method === "sms") {
      user.phoneVerified = true;
    }

    await user.save();

    res.json({
      message: "2FA enabled successfully",
      method: method,
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send OTP for 2FA verification (login, disable, etc.)
router.post("/2fa/verify-send", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    // Generate and send OTP
    const otp = OTPService.generateOTP();
    const expiry = OTPService.generateExpiry();

    let sent = false;
    if (user.twoFactorMethod === "sms") {
      sent = await OTPService.sendSMSOTP(user.phone, otp);
    } else {
      sent = await OTPService.sendEmailOTP(user.email, otp);
    }

    if (!sent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    // Save OTP
    user.otpCode = otp;
    user.otpExpiry = expiry;
    await user.save();

    res.json({
      message: `OTP sent to your ${user.twoFactorMethod}`,
      method: user.twoFactorMethod,
    });
  } catch (error) {
    console.error("Send verification OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Disable 2FA
router.post("/2fa/disable", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    // Verify OTP
    const isValid = OTPService.verifyOTP(otp, user.otpCode, user.otpExpiry);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorMethod = "sms";
    user.otpCode = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
