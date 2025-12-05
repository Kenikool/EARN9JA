import { Request, Response } from "express";
import { adminService } from "../services/AdminService.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

class AdminController {
  // User Management
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        status,
        role,
        isKYCVerified,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        status,
        role,
        isKYCVerified:
          isKYCVerified === "true"
            ? true
            : isKYCVerified === "false"
            ? false
            : undefined,
        search,
      };

      const result = await adminService.getAllUsers(
        filters,
        Number(page),
        Number(limit)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  }

  async getUserDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const result = await adminService.getUserDetails(userId);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Get user details error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user details",
      });
    }
  }

  async suspendUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.suspendUser(userId, reason, adminId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Suspend user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to suspend user",
      });
    }
  }

  async banUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.banUser(userId, reason, adminId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Ban user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to ban user",
      });
    }
  }

  async reactivateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.reactivateUser(userId, adminId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Reactivate user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reactivate user",
      });
    }
  }

  // Task Moderation
  async getPendingTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await adminService.getPendingTasks(
        Number(page),
        Number(limit)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get pending tasks error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending tasks",
      });
    }
  }

  async approveTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.approveTask(taskId, adminId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Approve task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve task",
      });
    }
  }

  async rejectTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.rejectTask(taskId, reason, adminId);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Reject task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject task",
      });
    }
  }

  // Withdrawal Management
  async getPendingWithdrawals(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await adminService.getPendingWithdrawals(
        Number(page),
        Number(limit)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get pending withdrawals error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending withdrawals",
      });
    }
  }

  async approveWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { withdrawalId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.approveWithdrawal(
        withdrawalId,
        adminId
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Approve withdrawal error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve withdrawal",
      });
    }
  }

  async rejectWithdrawal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { withdrawalId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.rejectWithdrawal(
        withdrawalId,
        reason,
        adminId
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Reject withdrawal error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject withdrawal",
      });
    }
  }

  // Platform Analytics
  async getPlatformStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await adminService.getPlatformStats();

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get platform stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch platform statistics",
      });
    }
  }

  async getRevenueReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
        return;
      }

      const result = await adminService.getRevenueReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get revenue report error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate revenue report",
      });
    }
  }

  // Dispute Resolution
  async getPendingDisputes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await adminService.getPendingDisputes(
        Number(page),
        Number(limit)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Get pending disputes error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending disputes",
      });
    }
  }

  async getDisputeDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;

      const result = await adminService.getDisputeDetails(disputeId);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Get dispute details error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dispute details",
      });
    }
  }

  async resolveDispute(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { decision, action, notes } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await adminService.resolveDispute(
        disputeId,
        { decision, action, notes },
        adminId
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Resolve dispute error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resolve dispute",
      });
    }
  }

  async updateDisputeStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { status } = req.body;

      const result = await adminService.updateDisputeStatus(disputeId, status);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Update dispute status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update dispute status",
      });
    }
  }
}

export const adminController = new AdminController();
