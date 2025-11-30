import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ReferralService } from "../services/ReferralService";

class ReferralController {
  /**
   * Get user's referral code and statistics
   */
  async getReferralStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await ReferralService.getReferralStats(userId);
      res.json(stats);
    } catch (error: any) {
      console.error("❌ Get referral stats error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Validate a referral code
   */
  async validateCode(req: AuthRequest, res: Response) {
    try {
      const { code } = req.params;
      const isValid = await ReferralService.validateReferralCode(code);

      if (!isValid) {
        return res.status(404).json({
          valid: false,
          message: "Invalid referral code",
        });
      }

      const referrerInfo = await ReferralService.getReferrerInfo(code);

      res.json({
        valid: true,
        referrer: referrerInfo,
      });
    } catch (error: any) {
      console.error("❌ Validate referral code error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Apply referral code (during registration)
   */
  async applyCode(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Referral code is required" });
      }

      await ReferralService.applyReferralCode(userId, code);

      res.json({
        success: true,
        message: "Referral code applied successfully",
      });
    } catch (error: any) {
      console.error("❌ Apply referral code error:", error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Generate referral code for user
   */
  async generateCode(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const code = await ReferralService.generateReferralCode(userId);

      res.json({
        referralCode: code,
      });
    } catch (error: any) {
      console.error("❌ Generate referral code error:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

export const referralController = new ReferralController();
