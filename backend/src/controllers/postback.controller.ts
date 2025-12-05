import { Request, Response } from "express";
import { postbackWebhookService } from "../services/PostbackWebhookService.js";
import { PostbackLog } from "../models/PostbackLog.js";
import { logger } from "../config/logger.js";

export class PostbackController {
  /**
   * Handle postback webhook from offer wall providers
   * POST /api/postback/:providerId
   */
  async handlePostback(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const { providerId } = req.params;
      const postbackData = req.query; // Most providers send data as query params
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get("user-agent");

      logger.info("Received postback", {
        providerId,
        ip: ipAddress,
        data: postbackData,
      });

      // Map provider-specific parameters to our standard format
      const standardizedData = this.standardizePostbackData(
        providerId,
        postbackData
      );

      if (!standardizedData) {
        logger.error("Failed to standardize postback data", {
          providerId,
          data: postbackData,
        });
        return res.status(400).send("Invalid postback data");
      }

      // Process the postback
      const result = await postbackWebhookService.processPostback(
        standardizedData,
        ipAddress,
        userAgent
      );

      // Log the postback attempt
      const processingTime = Date.now() - startTime;
      await PostbackLog.create({
        providerId,
        externalTransactionId: standardizedData.transactionId,
        userId: standardizedData.userId,
        requestData: postbackData,
        requestHeaders: req.headers,
        ipAddress,
        userAgent,
        processingResult: result,
        processingTime,
      }).catch((err) => logger.error("Failed to log postback:", err));

      if (result.success) {
        // Return success response (format varies by provider)
        return res.status(200).send("1"); // Most providers expect "1" for success
      } else {
        logger.error("Postback processing failed", {
          providerId,
          error: result.error,
          message: result.message,
        });
        return res.status(400).send("0"); // Most providers expect "0" for failure
      }
    } catch (error: any) {
      logger.error("Error handling postback:", error);

      // Log the error
      const processingTime = Date.now() - startTime;
      await PostbackLog.create({
        providerId: req.params.providerId,
        requestData: req.query,
        requestHeaders: req.headers,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get("user-agent"),
        processingResult: {
          success: false,
          message: "Internal server error",
          error: error.message,
        },
        processingTime,
      }).catch((err) => logger.error("Failed to log postback error:", err));

      return res.status(500).send("0");
    }
  }

  /**
   * Standardize postback data from different providers
   */
  private standardizePostbackData(providerId: string, data: any): any | null {
    try {
      switch (providerId.toLowerCase()) {
        case "cpagrip":
          return this.standardizeCPAGripData(data);
        case "ogads":
          return this.standardizeOGAdsData(data);
        case "adgatemedia":
          return this.standardizeAdGateData(data);
        case "offertoro":
          return this.standardizeOfferToroData(data);
        default:
          logger.warn(`Unknown provider: ${providerId}`);
          return null;
      }
    } catch (error) {
      logger.error("Error standardizing postback data:", error);
      return null;
    }
  }

  /**
   * Standardize CPAGrip postback data
   * Example: ?user_id=123&transaction_id=abc&amount=1.50&currency=USD&offer_name=Test&signature=xyz
   */
  private standardizeCPAGripData(data: any): any {
    return {
      userId: data.user_id || data.subid,
      transactionId: data.transaction_id || data.txn_id,
      amount: parseFloat(data.amount || data.payout),
      currency: data.currency || "USD",
      offerName: data.offer_name || data.offer,
      offerCategory: data.category || "general",
      providerId: "cpagrip",
      providerName: "CPAGrip",
      signature: data.signature || data.hash,
      timestamp: data.timestamp,
      ...data, // Include all original data
    };
  }

  /**
   * Standardize OGAds postback data
   * Example: ?aff_sub=123&transaction_id=abc&amount=1.50&currency=USD&offer_title=Test&hash=xyz
   */
  private standardizeOGAdsData(data: any): any {
    return {
      userId: data.aff_sub || data.subid,
      transactionId: data.transaction_id || data.txid,
      amount: parseFloat(data.amount || data.payout),
      currency: data.currency || "USD",
      offerName: data.offer_title || data.offer_name,
      offerCategory: data.category || "general",
      providerId: "ogads",
      providerName: "OGAds",
      hash: data.hash || data.security_hash,
      timestamp: data.timestamp,
      ...data,
    };
  }

  /**
   * Standardize AdGate Media postback data
   */
  private standardizeAdGateData(data: any): any {
    return {
      userId: data.subid || data.user_id,
      transactionId: data.id || data.transaction_id,
      amount: parseFloat(data.point_value || data.amount),
      currency: data.currency || "USD",
      offerName: data.offer_name || data.name,
      offerCategory: data.category || "general",
      providerId: "adgatemedia",
      providerName: "AdGate Media",
      signature: data.signature,
      timestamp: data.timestamp,
      ...data,
    };
  }

  /**
   * Standardize OfferToro postback data
   */
  private standardizeOfferToroData(data: any): any {
    return {
      userId: data.oid || data.user_id,
      transactionId: data.o_id || data.transaction_id,
      amount: parseFloat(data.amount || data.payout),
      currency: data.currency || "USD",
      offerName: data.offer_name || data.offer_title,
      offerCategory: data.category || "general",
      providerId: "offertoro",
      providerName: "OfferToro",
      signature: data.sig || data.signature,
      timestamp: data.timestamp,
      ...data,
    };
  }

  /**
   * Get transaction status
   * GET /api/postback/transaction/:transactionId
   */
  async getTransactionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      const transaction =
        await postbackWebhookService.getTransactionByExternalId(transactionId);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          transactionId: transaction._id,
          externalTransactionId: transaction.externalTransactionId,
          status: transaction.status,
          amount: transaction.userEarnings,
          currency: "NGN",
          processedAt: transaction.processedAt,
          createdAt: transaction.createdAt,
        },
      });
    } catch (error: any) {
      logger.error("Error getting transaction status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get transaction status",
      });
    }
  }

  /**
   * Get user's offer wall transactions
   * GET /api/postback/user/:userId/transactions
   */
  async getUserTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const transactions = await postbackWebhookService.getUserTransactions(
        userId,
        limit
      );

      res.json({
        success: true,
        data: transactions.map((t) => ({
          id: t._id,
          offerName: t.offerName,
          provider: t.providerName,
          amount: t.userEarnings,
          status: t.status,
          completedAt: t.processedAt,
          createdAt: t.createdAt,
        })),
      });
    } catch (error: any) {
      logger.error("Error getting user transactions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  }

  /**
   * Get provider statistics (admin only)
   * GET /api/postback/provider/:providerId/stats
   */
  async getProviderStats(req: Request, res: Response) {
    try {
      const { providerId } = req.params;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const stats = await postbackWebhookService.getProviderStats(
        providerId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: stats,
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
   * Test postback endpoint (for development)
   * POST /api/postback/test
   */
  async testPostback(req: Request, res: Response): Promise<void> {
    try {
      if (process.env.NODE_ENV === "production") {
        res.status(403).json({
          success: false,
          message: "Test endpoint not available in production",
        });
        return;
      }

      const testData = {
        userId: req.body.userId || "test_user_123",
        transactionId: `test_${Date.now()}`,
        amount: req.body.amount || 1.5,
        currency: req.body.currency || "USD",
        offerName: req.body.offerName || "Test Offer",
        offerCategory: "test",
        providerId: req.body.providerId || "cpagrip",
        providerName: req.body.providerName || "CPAGrip",
      };

      const result = await postbackWebhookService.processPostback(
        testData,
        req.ip,
        req.get("user-agent")
      );

      res.json(result);
    } catch (error: any) {
      logger.error("Error testing postback:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Test failed",
      });
    }
  }
}

export const postbackController = new PostbackController();
