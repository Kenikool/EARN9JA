import { Request, Response } from "express";
import { kycService } from "../services/KYCService.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

class KYCController {
  async submitKYC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await kycService.submitKYC(userId, req.body);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Submit KYC error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit KYC",
      });
    }
  }

  async getKYCStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await kycService.getKYCStatus(userId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get KYC status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch KYC status",
      });
    }
  }

  async approveKYC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { kycId } = req.params;
      const result = await kycService.approveKYC(kycId, adminId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Approve KYC error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve KYC",
      });
    }
  }

  async rejectKYC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { kycId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
        return;
      }

      const result = await kycService.rejectKYC(kycId, adminId, reason);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Reject KYC error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject KYC",
      });
    }
  }

  async getPendingKYCs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await kycService.getPendingKYCs(page, limit);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get pending KYCs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending KYCs",
      });
    }
  }
}

export const kycController = new KYCController();
