import { Request, Response } from "express";
import { ExternalProvider } from "../models/ExternalProvider.js";
import { OfferWallTransaction } from "../models/OfferWallTransaction.js";
import { logger } from "../config/logger.js";

export class ProviderController {
  /**
   * Get all providers
   * GET /api/providers
   */
  async getAllProviders(req: Request, res: Response): Promise<void> {
    try {
      const { status, category, providerType } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (providerType) filter.providerType = providerType;

      const providers = await ExternalProvider.find(filter).sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        data: providers,
      });
    } catch (error: any) {
      logger.error("Error getting providers:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get providers",
      });
    }
  }

  /**
   * Get provider by ID
   * GET /api/providers/:providerId
   */
  async getProviderById(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;

      const provider = await ExternalProvider.findOne({ providerId });

      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider not found",
        });
        return;
      }

      res.json({
        success: true,
        data: provider,
      });
    } catch (error: any) {
      logger.error("Error getting provider:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get provider",
      });
    }
  }

  /**
   * Create new provider
   * POST /api/providers
   */
  async createProvider(req: Request, res: Response): Promise<void> {
    try {
      const providerData = req.body;

      // Check if provider already exists
      const existing = await ExternalProvider.findOne({
        providerId: providerData.providerId,
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: "Provider with this ID already exists",
        });
        return;
      }

      const provider = await ExternalProvider.create(providerData);

      logger.info("Provider created", {
        providerId: provider.providerId,
        name: provider.name,
      });

      res.status(201).json({
        success: true,
        data: provider,
        message: "Provider created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating provider:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create provider",
      });
    }
  }

  /**
   * Update provider
   * PUT /api/providers/:providerId
   */
  async updateProvider(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;
      const updates = req.body;

      // Don't allow changing providerId
      delete updates.providerId;

      const provider = await ExternalProvider.findOneAndUpdate(
        { providerId },
        updates,
        { new: true, runValidators: true }
      );

      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider not found",
        });
        return;
      }

      logger.info("Provider updated", {
        providerId: provider.providerId,
        updates: Object.keys(updates),
      });

      res.json({
        success: true,
        data: provider,
        message: "Provider updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating provider:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update provider",
      });
    }
  }

  /**
   * Enable/disable provider
   * PATCH /api/providers/:providerId/status
   */
  async updateProviderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;
      const { status, reason } = req.body;

      if (!["active", "inactive", "disabled"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
        return;
      }

      const updates: any = { status };
      if (status === "disabled") {
        updates.disabledReason = reason;
        updates.disabledAt = new Date();
      }

      const provider = await ExternalProvider.findOneAndUpdate(
        { providerId },
        updates,
        { new: true }
      );

      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider not found",
        });
        return;
      }

      logger.info("Provider status updated", {
        providerId,
        status,
        reason,
      });

      res.json({
        success: true,
        data: provider,
        message: `Provider ${status} successfully`,
      });
    } catch (error: any) {
      logger.error("Error updating provider status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update provider status",
      });
    }
  }

  /**
   * Delete provider
   * DELETE /api/providers/:providerId
   */
  async deleteProvider(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;

      // Check if provider has transactions
      const transactionCount = await OfferWallTransaction.countDocuments({
        providerId,
      });

      if (transactionCount > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot delete provider with ${transactionCount} transactions. Disable it instead.`,
        });
        return;
      }

      const provider = await ExternalProvider.findOneAndDelete({ providerId });

      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider not found",
        });
        return;
      }

      logger.info("Provider deleted", { providerId });

      res.json({
        success: true,
        message: "Provider deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting provider:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete provider",
      });
    }
  }

  /**
   * Get provider statistics
   * GET /api/providers/:providerId/stats
   */
  async getProviderStats(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;
      const { startDate, endDate } = req.query;

      const provider = await ExternalProvider.findOne({ providerId });

      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider not found",
        });
        return;
      }

      // Get transaction stats
      const stats = await OfferWallTransaction.getProviderStats(
        providerId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      // Get recent transactions
      const recentTransactions = await OfferWallTransaction.find({
        providerId,
        status: "completed",
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("offerName userEarnings commissionAmount createdAt");

      res.json({
        success: true,
        data: {
          provider: {
            id: provider.providerId,
            name: provider.name,
            status: provider.status,
            commissionRate: provider.commissionRate,
          },
          stats,
          recentTransactions,
        },
      });
    } catch (error: any) {
      logger.error("Error getting provider stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get provider stats",
      });
    }
  }

  /**
   * Get all providers dashboard stats
   * GET /api/providers/dashboard/stats
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate)
          dateFilter.createdAt.$gte = new Date(startDate as string);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
      }

      // Get all providers
      const providers = await ExternalProvider.find();

      // Get aggregated stats
      const aggregatedStats = await OfferWallTransaction.aggregate([
        {
          $match: {
            status: "completed",
            ...dateFilter,
          },
        },
        {
          $group: {
            _id: "$providerId",
            totalTransactions: { $sum: 1 },
            totalRevenue: { $sum: "$convertedAmount" },
            totalCommission: { $sum: "$commissionAmount" },
            totalUserEarnings: { $sum: "$userEarnings" },
            avgTransactionValue: { $avg: "$convertedAmount" },
          },
        },
      ]);

      // Combine provider info with stats
      const providerStats = providers.map((provider) => {
        const stats = aggregatedStats.find(
          (s) => s._id === provider.providerId
        ) || {
          totalTransactions: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalUserEarnings: 0,
          avgTransactionValue: 0,
        };

        return {
          providerId: provider.providerId,
          providerName: provider.name,
          status: provider.status,
          commissionRate: provider.commissionRate,
          ...stats,
        };
      });

      // Calculate totals
      const totals = {
        totalProviders: providers.length,
        activeProviders: providers.filter((p) => p.status === "active").length,
        totalTransactions: aggregatedStats.reduce(
          (sum, s) => sum + s.totalTransactions,
          0
        ),
        totalRevenue: aggregatedStats.reduce(
          (sum, s) => sum + s.totalRevenue,
          0
        ),
        totalCommission: aggregatedStats.reduce(
          (sum, s) => sum + s.totalCommission,
          0
        ),
        totalUserEarnings: aggregatedStats.reduce(
          (sum, s) => sum + s.totalUserEarnings,
          0
        ),
      };

      res.json({
        success: true,
        data: {
          totals,
          providers: providerStats,
        },
      });
    } catch (error: any) {
      logger.error("Error getting dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get dashboard stats",
      });
    }
  }
}

export const providerController = new ProviderController();
