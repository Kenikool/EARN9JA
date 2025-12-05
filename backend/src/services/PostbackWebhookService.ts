import crypto from "crypto";
import { OfferWallTransaction } from "../models/OfferWallTransaction.js";
import { User } from "../models/User.js";
import { Wallet } from "../models/Wallet.js";
import { Transaction } from "../models/Transaction.js";
import { ExternalProvider } from "../models/ExternalProvider.js";
import { currencyService } from "./CurrencyConversionService.js";
import { fraudPreventionService } from "./FraudPreventionService.js";
import { logger } from "../config/logger.js";
import notificationService from "./NotificationService.js";

interface PostbackData {
  userId: string;
  transactionId: string;
  amount: number;
  currency: string;
  offerName: string;
  offerCategory?: string;
  providerId: string;
  providerName: string;
  signature?: string;
  hash?: string;
  timestamp?: string;
  [key: string]: any;
}

interface ProcessingResult {
  success: boolean;
  message: string;
  transactionId?: string;
  userEarnings?: number;
  error?: string;
}

export class PostbackWebhookService {
  private readonly DUPLICATE_CHECK_WINDOW = 60 * 1000; // 1 minute

  /**
   * Process incoming postback from offer wall provider
   */
  async processPostback(
    postbackData: PostbackData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ProcessingResult> {
    try {
      logger.info("Processing postback", {
        providerId: postbackData.providerId,
        transactionId: postbackData.transactionId,
        userId: postbackData.userId,
      });

      // 1. Fraud prevention checks
      const fraudCheck = await fraudPreventionService.checkForFraud(
        postbackData.userId,
        postbackData.transactionId,
        postbackData.amount,
        postbackData.providerId
      );

      if (fraudCheck.isFraudulent) {
        logger.warn("Fraudulent transaction blocked", {
          transactionId: postbackData.transactionId,
          userId: postbackData.userId,
          reasons: fraudCheck.reasons,
          riskScore: fraudCheck.riskScore,
        });
        return {
          success: false,
          message: "Transaction blocked: " + fraudCheck.reasons.join(", "),
          error: "FRAUD_DETECTED",
        };
      }

      // Log flagged transactions
      if (fraudCheck.action === "flag") {
        logger.warn("Transaction flagged for review", {
          transactionId: postbackData.transactionId,
          userId: postbackData.userId,
          reasons: fraudCheck.reasons,
          riskScore: fraudCheck.riskScore,
        });
      }

      // Track IP address
      if (ipAddress) {
        const ipCheck = await fraudPreventionService.trackIPAddress(
          ipAddress,
          postbackData.userId
        );
        if (ipCheck.suspicious) {
          logger.warn("Suspicious IP activity", {
            ipAddress,
            reason: ipCheck.reason,
          });
        }
      }

      // 2. Verify user exists
      const user = await User.findById(postbackData.userId);
      if (!user) {
        logger.error("User not found", { userId: postbackData.userId });
        return {
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        };
      }

      // 3. Get provider configuration
      const provider = await this.getProviderConfig(postbackData.providerId);
      if (!provider) {
        logger.error("Provider not found", {
          providerId: postbackData.providerId,
        });
        return {
          success: false,
          message: "Provider not configured",
          error: "PROVIDER_NOT_FOUND",
        };
      }

      // 4. Verify signature/hash if provided
      const verificationResult = await this.verifyPostback(
        postbackData,
        provider,
        ipAddress
      );
      if (!verificationResult.verified) {
        logger.error("Postback verification failed", {
          transactionId: postbackData.transactionId,
          reason: verificationResult.reason,
        });
        return {
          success: false,
          message: "Verification failed",
          error: "VERIFICATION_FAILED",
        };
      }

      // 5. Convert currency to NGN
      const convertedAmount = await currencyService.convert(
        postbackData.amount,
        postbackData.currency,
        "NGN"
      );

      // 6. Calculate commission and user earnings
      const commissionRate = provider.commissionRate || 0.2; // Default 20%
      const commissionAmount = convertedAmount * commissionRate;
      const userEarnings = convertedAmount - commissionAmount;

      // 7. Create transaction record
      const transaction = await OfferWallTransaction.create({
        userId: postbackData.userId,
        providerId: postbackData.providerId,
        providerName: postbackData.providerName,
        externalTransactionId: postbackData.transactionId,
        offerName: postbackData.offerName,
        offerCategory: postbackData.offerCategory || "general",
        originalAmount: postbackData.amount,
        originalCurrency: postbackData.currency,
        convertedAmount,
        commissionRate,
        commissionAmount,
        userEarnings,
        status: "pending",
        postbackData,
        ipAddress,
        userAgent,
        verificationStatus: verificationResult.verified
          ? "verified"
          : "unverified",
        verificationMethod: verificationResult.method,
      });

      // 8. Credit user wallet
      const creditResult = await this.creditUserWallet(
        postbackData.userId,
        userEarnings,
        transaction._id.toString(),
        postbackData.offerName
      );

      if (!creditResult.success) {
        // Mark transaction as failed
        transaction.status = "failed";
        transaction.failureReason = creditResult.error;
        await transaction.save();

        return {
          success: false,
          message: "Failed to credit wallet",
          error: creditResult.error,
        };
      }

      // 9. Mark transaction as completed
      transaction.status = "completed";
      transaction.processedAt = new Date();
      await transaction.save();

      // 10. Send notification to user
      await this.notifyUser(user, userEarnings, postbackData.offerName);

      // 11. Update provider metrics
      await this.updateProviderMetrics(
        postbackData.providerId,
        convertedAmount,
        commissionAmount
      );

      logger.info("Postback processed successfully", {
        transactionId: transaction._id,
        userId: postbackData.userId,
        userEarnings,
      });

      return {
        success: true,
        message: "Transaction processed successfully",
        transactionId: transaction._id.toString(),
        userEarnings,
      };
    } catch (error: any) {
      logger.error("Error processing postback:", error);
      return {
        success: false,
        message: "Internal server error",
        error: error.message,
      };
    }
  }

  /**
   * Get provider configuration
   */
  private async getProviderConfig(providerId: string): Promise<any> {
    // Fetch from ExternalProvider model
    const provider = await ExternalProvider.findOne({
      providerId,
      status: "active",
    });

    if (provider) {
      return {
        commissionRate: provider.commissionRate,
        secretKey: provider.apiSecret || provider.apiKey,
        ipWhitelist: [], // Can be added to provider config if needed
      };
    }

    // Fallback to environment variables for backward compatibility
    const providers: any = {
      cpagrip: {
        commissionRate: 0.2,
        secretKey: process.env.CPAGRIP_SECRET_KEY,
        ipWhitelist: [
          "52.89.214.238",
          "34.212.75.30",
          // Local development IPs
          "127.0.0.1",
          "::1",
          "localhost",
          // Your current IPs
          "172.16.0.2", // CloudflareWARP
          "192.168.128.1", // WSL
          "10.140.99.25", // Wi-Fi
        ],
      },
      ogads: {
        commissionRate: 0.18,
        secretKey: process.env.OGADS_SECRET_KEY,
        ipWhitelist: [
          "104.18.0.0/16",
          // Local development IPs
          "127.0.0.1",
          "::1",
          "localhost",
          // Your current IPs
          "172.16.0.2", // CloudflareWARP
          "192.168.128.1", // WSL
          "10.140.99.25", // Wi-Fi
        ],
      },
    };

    return providers[providerId];
  }

  /**
   * Verify postback authenticity
   */
  private async verifyPostback(
    postbackData: PostbackData,
    provider: any,
    ipAddress?: string
  ): Promise<{ verified: boolean; method?: string; reason?: string }> {
    // Method 1: Signature verification
    if (postbackData.signature && provider.secretKey) {
      const isValid = this.verifySignature(
        postbackData,
        provider.secretKey,
        postbackData.signature
      );
      if (isValid) {
        return { verified: true, method: "signature" };
      }
      return { verified: false, reason: "Invalid signature" };
    }

    // Method 2: Hash verification
    if (postbackData.hash && provider.secretKey) {
      const isValid = this.verifyHash(
        postbackData,
        provider.secretKey,
        postbackData.hash
      );
      if (isValid) {
        return { verified: true, method: "hash" };
      }
      return { verified: false, reason: "Invalid hash" };
    }

    // Method 3: IP whitelist
    if (ipAddress && provider.ipWhitelist) {
      const isWhitelisted = this.checkIPWhitelist(
        ipAddress,
        provider.ipWhitelist
      );
      if (isWhitelisted) {
        return { verified: true, method: "ip_whitelist" };
      }
      return { verified: false, reason: "IP not whitelisted" };
    }

    // No verification method available - accept but mark as unverified
    logger.warn("No verification method available for postback", {
      providerId: postbackData.providerId,
    });
    return { verified: true, method: "none" };
  }

  /**
   * Verify signature using HMAC
   */
  private verifySignature(
    data: PostbackData,
    secretKey: string,
    providedSignature: string
  ): boolean {
    // Create signature from data
    const dataString = `${data.userId}:${data.transactionId}:${data.amount}:${data.currency}`;
    const calculatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(dataString)
      .digest("hex");

    return calculatedSignature === providedSignature;
  }

  /**
   * Verify hash using MD5
   */
  private verifyHash(
    data: PostbackData,
    secretKey: string,
    providedHash: string
  ): boolean {
    // Create hash from data
    const dataString = `${data.userId}${data.transactionId}${data.amount}${secretKey}`;
    const calculatedHash = crypto
      .createHash("md5")
      .update(dataString)
      .digest("hex");

    return calculatedHash === providedHash;
  }

  /**
   * Check if IP is in whitelist
   */
  private checkIPWhitelist(ipAddress: string, whitelist: string[]): boolean {
    return whitelist.some((whitelistedIP) => {
      // Support CIDR notation
      if (whitelistedIP.includes("/")) {
        // Simple CIDR check (can be improved with ip-cidr library)
        const [network] = whitelistedIP.split("/");
        return ipAddress.startsWith(network.split(".").slice(0, 2).join("."));
      }
      return ipAddress === whitelistedIP;
    });
  }

  /**
   * Credit user wallet
   */
  private async creditUserWallet(
    userId: string,
    amount: number,
    transactionId: string,
    description: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user wallet
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return { success: false, error: "Wallet not found" };
      }

      // Credit wallet
      wallet.availableBalance += amount;
      wallet.lifetimeEarnings += amount;
      await wallet.save();

      // Create transaction record
      await Transaction.create({
        userId,
        type: "credit",
        category: "offer_wall",
        amount,
        balance: wallet.availableBalance,
        description: `Offer completed: ${description}`,
        reference: transactionId,
        status: "completed",
      });

      return { success: true };
    } catch (error: any) {
      logger.error("Error crediting wallet:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to user
   */
  private async notifyUser(
    user: any,
    amount: number,
    offerName: string
  ): Promise<void> {
    try {
      await notificationService.createNotification({
        userId: user._id.toString(),
        type: "payment_received" as any,
        title: "🎉 Offer Completed!",
        body: `You earned ₦${amount.toFixed(2)} from "${offerName}"`,
        data: {
          amount: amount.toString(),
          offerName,
        },
      });
    } catch (error) {
      logger.error("Error sending notification:", error);
    }
  }

  /**
   * Get transaction by external ID
   */
  async getTransactionByExternalId(
    externalTransactionId: string
  ): Promise<any> {
    return OfferWallTransaction.findByExternalId(externalTransactionId);
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return OfferWallTransaction.getUserTransactions(userId, limit);
  }

  /**
   * Update provider metrics after successful transaction
   */
  private async updateProviderMetrics(
    providerId: string,
    revenue: number,
    _commission: number
  ): Promise<void> {
    try {
      await ExternalProvider.findOneAndUpdate(
        { providerId },
        {
          $inc: {
            "metrics.totalCompletions": 1,
            "metrics.totalRevenue": revenue,
          },
        }
      );
    } catch (error) {
      logger.error("Error updating provider metrics:", error);
    }
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(
    providerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    return OfferWallTransaction.getProviderStats(
      providerId,
      startDate,
      endDate
    );
  }
}

export const postbackWebhookService = new PostbackWebhookService();
