import { ExternalProvider } from "../../models/ExternalProvider";
import { logger } from "../../config/logger";

export interface OfferWallConfig {
  offerWallUrl: string;
  publisherId: string;
  secretKey: string;
  commissionRate: number;
}

export class CPAGripProvider {
  private config: OfferWallConfig | null = null;
  private readonly providerId = "cpagrip";
  private readonly providerName = "CPAGrip";

  /**
   * Initialize provider with configuration from database
   */
  async initialize(): Promise<void> {
    try {
      const provider = await ExternalProvider.findOne({
        providerId: this.providerId,
      });

      if (!provider) {
        logger.warn("CPAGrip provider not configured in database");
        return;
      }

      this.config = {
        offerWallUrl: (provider.config as any).offerWallUrl,
        publisherId: (provider.config as any).publisherId,
        secretKey: provider.apiKey,
        commissionRate: provider.commissionRate || 0.2, // Default 20%
      };

      logger.info("CPAGrip provider initialized", {
        publisherId: this.config.publisherId,
        commissionRate: this.config.commissionRate,
      });
    } catch (error) {
      logger.error("Failed to initialize CPAGrip provider:", error);
      throw error;
    }
  }

  /**
   * Generate user-specific offer wall URL
   * @param userId - User ID to track completions
   * @param additionalParams - Optional additional parameters
   */
  generateOfferWallUrl(
    userId: string,
    additionalParams?: Record<string, string>
  ): string {
    if (!this.config) {
      throw new Error("CPAGrip provider not initialized");
    }

    // Build URL with user tracking
    const params = new URLSearchParams({
      user_id: userId,
      subid: userId, // Alternative parameter name
      publisher_id: this.config.publisherId,
      ...additionalParams,
    });

    const url = `${this.config.offerWallUrl}?${params.toString()}`;

    logger.info("Generated CPAGrip offer wall URL", {
      userId,
      url: url.substring(0, 100) + "...",
    });

    return url;
  }

  /**
   * Get postback URL for CPAGrip dashboard configuration
   * This URL should be configured in CPAGrip dashboard
   */
  getPostbackUrl(baseUrl: string): string {
    return `${baseUrl}/api/postback/cpagrip?user_id={subid}&transaction_id={transaction_id}&amount={amount}&currency={currency}&offer_name={offer_name}&signature={signature}`;
  }

  /**
   * Verify postback signature
   */
  verifySignature(data: any, providedSignature: string): boolean {
    if (!this.config) {
      throw new Error("CPAGrip provider not initialized");
    }

    const crypto = require("crypto");
    const dataString = `${data.user_id}:${data.transaction_id}:${data.amount}:${data.currency}`;
    const calculatedSignature = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(dataString)
      .digest("hex");

    return calculatedSignature === providedSignature;
  }

  /**
   * Get provider configuration
   */
  getConfig(): OfferWallConfig | null {
    return this.config;
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      providerId: this.providerId,
      providerName: this.providerName,
      commissionRate: this.config?.commissionRate || 0.2,
      isConfigured: !!this.config,
    };
  }

  /**
   * Save or update provider configuration in database
   */
  async saveConfiguration(config: {
    offerWallUrl: string;
    publisherId: string;
    secretKey: string;
    commissionRate?: number;
  }): Promise<void> {
    try {
      await ExternalProvider.findOneAndUpdate(
        { providerId: this.providerId },
        {
          providerId: this.providerId,
          name: this.providerName,
          category: "offer_wall",
          apiEndpoint: config.offerWallUrl,
          apiKey: config.secretKey,
          status: "active",
          commissionRate: config.commissionRate || 0.2,
          config: {
            offerWallUrl: config.offerWallUrl,
            publisherId: config.publisherId,
          },
        },
        { upsert: true, new: true }
      );

      // Reload configuration
      await this.initialize();

      logger.info("CPAGrip configuration saved successfully");
    } catch (error) {
      logger.error("Failed to save CPAGrip configuration:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const cpaGripProvider = new CPAGripProvider();
