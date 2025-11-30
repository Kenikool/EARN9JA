import { Request, Response } from "express";
import { authService } from "../services/AuthService.js";
import { otpService } from "../services/OTPService.js";
import { smsService } from "../services/SMSService.js";
import { emailService } from "../services/EmailService.js";

class AuthController {
  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, type, purpose } = req.body;

      console.log(`📧 Sending OTP to ${identifier} (${type}) for ${purpose}`);

      const result = await otpService.sendOTP(identifier, type, purpose);

      if (!result.success) {
        console.error(`❌ OTP generation failed: ${result.message}`);
        res.status(400).json(result);
        return;
      }

      // Get the OTP code that was just saved
      const otpRecord = await otpService.getLatestOTP(identifier, purpose);

      if (!otpRecord) {
        console.error("❌ Failed to retrieve OTP record");
        res.status(500).json({
          success: false,
          message: "Failed to send OTP",
        });
        return;
      }

      const code = otpRecord.code;
      console.log(`🔑 OTP Code for ${identifier}: ${code}`);

      // Send via email or SMS
      let sendSuccess = false;
      if (type === "email") {
        if (purpose === "password_reset") {
          sendSuccess = await emailService.sendPasswordResetOTP(
            identifier,
            code
          );
        } else {
          sendSuccess = await emailService.sendOTP(identifier, code);
        }
      } else {
        if (purpose === "password_reset") {
          sendSuccess = await smsService.sendPasswordResetOTP(identifier, code);
        } else {
          sendSuccess = await smsService.sendOTP(identifier, code);
        }
      }

      if (!sendSuccess) {
        console.error(`❌ Failed to send ${type} to ${identifier}`);
        res.status(500).json({
          success: false,
          message: `Failed to send OTP via ${type}`,
        });
        return;
      }

      console.log(`✅ OTP sent successfully to ${identifier}`);
      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Send OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, code, purpose } = req.body;

      const result = await otpService.verifyOTP(identifier, code, purpose);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "📝 Registration request body:",
        JSON.stringify(req.body, null, 2)
      );

      const { email, phoneNumber } = req.body;

      const emailVerified = await otpService.isOTPVerified(
        email,
        "registration"
      );
      const phoneVerified = await otpService.isOTPVerified(
        phoneNumber,
        "registration"
      );

      console.log(
        `🔐 Email verified: ${emailVerified}, Phone verified: ${phoneVerified}`
      );

      if (!emailVerified && !phoneVerified) {
        console.log("❌ Neither email nor phone verified");
        res.status(400).json({
          success: false,
          message: "Please verify your email or phone number first",
        });
        return;
      }

      const result = await authService.register(req.body);

      if (!result.success) {
        console.log("❌ Registration failed:", result.message);
        res.status(400).json(result);
        return;
      }

      if (result.user) {
        await emailService.sendWelcomeEmail(
          result.user.email,
          result.user.profile.firstName
        );
      }

      console.log("✅ Registration successful");
      res.status(201).json(result);
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        success: false,
        message: "Token refresh failed",
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, newPassword } = req.body;

      const isVerified = await otpService.isOTPVerified(
        identifier,
        "password_reset"
      );

      if (!isVerified) {
        res.status(400).json({
          success: false,
          message: "Please verify OTP first",
        });
        return;
      }

      const result = await authService.resetPassword(identifier, newPassword);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Password reset failed",
      });
    }
  }

  async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, type, purpose } = req.body;

      const result = await otpService.resendOTP(identifier, type, purpose);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resend OTP",
      });
    }
  }
}

export const authController = new AuthController();
