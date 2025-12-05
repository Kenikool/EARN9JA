import { ExternalProvider } from "../../models/ExternalProvider";
import { logger } from "../../config/logger";

export interface OGAdsConfig {
  offerWallUrl: string;
  apiKey: string;
  secretKey: string;
  commissionRate: number;
}

export class OGAdsProvider {
  private config: OGAdsConfig | null = null;
  private readonly providerId = "ogads";
  private readonly providerName = "OGAds";

  /**
   * Initialize provider with configuration from database
   */
  async initialize(): Promise<void> {
    try {
      const provider = await ExternalProvider.findOne({
        providerId: this.providerId,
      });

      if (!provider) {
        logger.warn("OGAds provider not configured in database");
        return;
      }

      this.config = {
        offerWallUrl: (provider.config as any).offerWallUrl,
        apiKey: provider.apiKey,
        secretKey: provider.apiSecret || provider.apiKey,
        commissionRate: provider.commissionRate || 0.18, // Default 18%
      };

      logger.info("OGAds provider initialized", {
        commissionRate: this.config.commissionRate,
      });
    } catch (error) {
      logger.error("Failed to initialize OGAds provider:", error);
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
      throw new Error("OGAds provider not initialized");
    }

    // Build URL with user tracking
    const params = new URLSearchParams({
      aff_sub: userId, // OGAds uses aff_sub for tracking
      subid: userId, // Alternative parameter
      api_key: this.config.apiKey,
      ...additionalParams,
    });

    const url = `${this.config.offerWallUrl}?${params.toString()}`;

    logger.info("Generated OGAds offer wall URL", {
      userId,
      url: url.substring(0, 100) + "...",
    });

    return url;
  }

  /**
   * Get postback URL for OGAds dashboard configuration
   * This URL should be configured in OGAds dashboard
   */
  getPostbackUrl(baseUrl: string): string {
    return `${baseUrl}/api/postback/ogads?aff_sub={aff_sub}&transaction_id={transaction_id}&amount={amount}&currency={currency}&offer_title={offer_title}&hash={hash}`;
  }

  /**
   * Verify postback hash
   */
  verifyHash(data: any, providedHash: string): boolean {
    if (!this.config) {
      throw new Error("OGAds provider not initialized");
    }

    const crypto = require("crypto");
    // OGAds typically uses MD5 hash
    const dataString = `${data.aff_sub}${data.transaction_id}${data.amount}${this.config.secretKey}`;
    const calculatedHash = crypto
      .createHash("md5")
      .update(dataString)
      .digest("hex");

    return calculatedHash === providedHash;
  }

  /**
   * Get provider configuration
   */
  getConfig(): OGAdsConfig | null {
    return this.config;
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      providerId: this.providerId,
      providerName: this.providerName,
      commissionRate: this.config?.commissionRate || 0.18,
      isConfigured: !!this.config,
    };
  }

  /**
   * Save or update provider configuration in database
   */
  async saveConfiguration(config: {
    offerWallUrl: string;
    apiKey: string;
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
          apiKey: config.apiKey,
          apiSecret: config.secretKey,
          status: "active",
          commissionRate: config.commissionRate || 0.18,
          config: {
            offerWallUrl: config.offerWallUrl,
          },
        },
        { upsert: true, new: true }
      );

      // Reload configuration
      await this.initialize();

      logger.info("OGAds configuration saved successfully");
    } catch (error) {
      logger.error("Failed to save OGAds configuration:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const ogAdsProvider = new OGAdsProvider();
