import { Request, Response } from "express";
import { TwoFactorAuthService } from "../services/TwoFactorAuthService.js";
import { FraudDetectionService } from "../services/FraudDetectionService.js";

class SecurityController {
  // 2FA Setup
  async setup2FA(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;

      const { secret, qrCode, backupCodes } =
        await TwoFactorAuthService.generateSecret(userId, userEmail);

      res.json({
        success: true,
        data: {
          secret,
          qrCode,
          backupCodes,
        },
        message:
          "Scan the QR code with your authenticator app and save your backup codes",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify and Enable 2FA
  async verify2FA(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      await TwoFactorAuthService.verifyAndEnable(userId, token);

      res.json({
        success: true,
        message: "2FA enabled successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Disable 2FA
  async disable2FA(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required to disable 2FA",
        });
      }

      // Verify token before disabling
      const isValid = await TwoFactorAuthService.verifyToken(userId, token);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid token",
        });
      }

      await TwoFactorAuthService.disable(userId);

      res.json({
        success: true,
        message: "2FA disabled successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get 2FA Status
  async get2FAStatus(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const status = await TwoFactorAuthService.getStatus(userId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Regenerate Backup Codes
  async regenerateBackupCodes(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      // Verify token before regenerating
      const isValid = await TwoFactorAuthService.verifyToken(userId, token);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid token",
        });
      }

      const backupCodes = await TwoFactorAuthService.regenerateBackupCodes(
        userId
      );

      res.json({
        success: true,
        data: { backupCodes },
        message: "Backup codes regenerated. Save them securely!",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Check Fraud Risk
  async checkFraudRisk(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { action, taskId, amount } = req.body;
      const deviceId = req.headers["x-device-id"] as string;
      const ipAddress =
        (req.headers["x-forwarded-for"] as string) || req.ip || "";

      const fraudCheck = await FraudDetectionService.comprehensiveCheck(
        userId,
        {
          action,
          deviceId,
          ipAddress,
          taskId,
          amount,
        }
      );

      // Log if fraudulent
      if (fraudCheck.isFraudulent) {
        await FraudDetectionService.logFraudAttempt(userId, action, fraudCheck);
      }

      res.json({
        success: true,
        data: fraudCheck,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const securityController = new SecurityController();
