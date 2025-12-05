import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import TwoFactorAuth from "../models/TwoFactorAuth.js";

export class TwoFactorAuthService {
  /**
   * Generate 2FA secret and QR code for user
   */
  static async generateSecret(
    userId: string,
    userEmail: string
  ): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Earn9ja (${userEmail})`,
      issuer: "Earn9ja",
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map((code) =>
      crypto.createHash("sha256").update(code).digest("hex")
    );

    // Save to database (not enabled yet)
    await TwoFactorAuth.findOneAndUpdate(
      { userId },
      {
        userId,
        secret: secret.base32,
        backupCodes: hashedBackupCodes,
        enabled: false,
      },
      { upsert: true, new: true }
    );

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes, // Return unhashed codes to user (only time they see them)
    };
  }

  /**
   * Verify 2FA token and enable 2FA
   */
  static async verifyAndEnable(
    userId: string,
    token: string
  ): Promise<boolean> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ userId });

    if (!twoFactorAuth) {
      throw new Error("2FA not set up for this user");
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      throw new Error("Invalid 2FA token");
    }

    // Enable 2FA
    twoFactorAuth.enabled = true;
    twoFactorAuth.verifiedAt = new Date();
    await twoFactorAuth.save();

    return true;
  }

  /**
   * Verify 2FA token
   */
  static async verifyToken(userId: string, token: string): Promise<boolean> {
    const twoFactorAuth = await TwoFactorAuth.findOne({
      userId,
      enabled: true,
    });

    if (!twoFactorAuth) {
      return false; // 2FA not enabled
    }

    // Check if it's a backup code
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const backupCodeIndex = twoFactorAuth.backupCodes.indexOf(hashedToken);

    if (backupCodeIndex !== -1) {
      // Remove used backup code
      twoFactorAuth.backupCodes.splice(backupCodeIndex, 1);
      await twoFactorAuth.save();
      return true;
    }

    // Verify TOTP token
    return speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: "base32",
      token,
      window: 2,
    });
  }

  /**
   * Disable 2FA
   */
  static async disable(userId: string): Promise<boolean> {
    const result = await TwoFactorAuth.findOneAndDelete({ userId });
    return !!result;
  }

  /**
   * Check if 2FA is enabled for user
   */
  static async isEnabled(userId: string): Promise<boolean> {
    const twoFactorAuth = await TwoFactorAuth.findOne({
      userId,
      enabled: true,
    });
    return !!twoFactorAuth;
  }

  /**
   * Get 2FA status
   */
  static async getStatus(userId: string): Promise<{
    enabled: boolean;
    verifiedAt?: Date;
    backupCodesRemaining: number;
  }> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ userId });

    if (!twoFactorAuth) {
      return {
        enabled: false,
        backupCodesRemaining: 0,
      };
    }

    return {
      enabled: twoFactorAuth.enabled,
      verifiedAt: twoFactorAuth.verifiedAt,
      backupCodesRemaining: twoFactorAuth.backupCodes.length,
    };
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const twoFactorAuth = await TwoFactorAuth.findOne({
      userId,
      enabled: true,
    });

    if (!twoFactorAuth) {
      throw new Error("2FA not enabled for this user");
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map((code) =>
      crypto.createHash("sha256").update(code).digest("hex")
    );

    twoFactorAuth.backupCodes = hashedBackupCodes;
    await twoFactorAuth.save();

    return backupCodes;
  }
}
