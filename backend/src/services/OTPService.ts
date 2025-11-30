import { OTP, IOTP } from "../models/OTP.js";
import { cacheService } from "./CacheService.js";

export class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds for development

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(
    identifier: string,
    type: "email" | "phone",
    purpose: "registration" | "login" | "password_reset" | "withdrawal"
  ): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
    try {
      const rateLimitKey = `otp_rate_limit:${identifier}:${purpose}`;
      const isRateLimited = await cacheService.exists(rateLimitKey);

      // Disable rate limiting in development for testing
      if (isRateLimited && process.env.NODE_ENV !== "development") {
        return {
          success: false,
          message: "Please wait before requesting another OTP",
        };
      }

      await OTP.deleteMany({
        identifier,
        purpose,
        verified: false,
      });

      const code = this.generateOTP();
      const expiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
      );

      const otp = await OTP.create({
        identifier,
        type,
        code,
        purpose,
        expiresAt,
        attempts: 0,
        verified: false,
      });

      await cacheService.set(rateLimitKey, true, 60);

      console.log(`OTP for ${identifier}: ${code}`);

      return {
        success: true,
        message: `OTP sent to ${type}`,
        expiresAt,
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        message: "Failed to send OTP",
      };
    }
  }

  async verifyOTP(
    identifier: string,
    code: string,
    purpose: "registration" | "login" | "password_reset" | "withdrawal"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const otp = await OTP.findOne({
        identifier,
        purpose,
        verified: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otp) {
        return {
          success: false,
          message: "OTP expired or not found",
        };
      }

      if (otp.attempts >= this.MAX_ATTEMPTS) {
        return {
          success: false,
          message: "Maximum attempts exceeded. Please request a new OTP",
        };
      }

      if (otp.code !== code) {
        otp.attempts += 1;
        await otp.save();

        return {
          success: false,
          message: `Invalid OTP. ${
            this.MAX_ATTEMPTS - otp.attempts
          } attempts remaining`,
        };
      }

      otp.verified = true;
      await otp.save();

      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        message: "Failed to verify OTP",
      };
    }
  }

  async resendOTP(
    identifier: string,
    type: "email" | "phone",
    purpose: "registration" | "login" | "password_reset" | "withdrawal"
  ): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
    return this.sendOTP(identifier, type, purpose);
  }

  async getLatestOTP(
    identifier: string,
    purpose: "registration" | "login" | "password_reset" | "withdrawal"
  ): Promise<IOTP | null> {
    try {
      const otp = await OTP.findOne({
        identifier,
        purpose,
        verified: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      return otp;
    } catch (error) {
      console.error("Error getting latest OTP:", error);
      return null;
    }
  }

  async isOTPVerified(
    identifier: string,
    purpose: "registration" | "login" | "password_reset" | "withdrawal"
  ): Promise<boolean> {
    const otp = await OTP.findOne({
      identifier,
      purpose,
      verified: true,
    }).sort({ createdAt: -1 });

    return !!otp;
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await OTP.deleteMany({
        expiresAt: { $lt: new Date() },
      });
    } catch (error) {
      console.error("Error cleaning up expired OTPs:", error);
    }
  }
}

export const otpService = new OTPService();
