import cron from "node-cron";
import { ExternalProvider } from "../models/ExternalProvider.js";
import { OfferWallTransaction } from "../models/OfferWallTransaction.js";
import { logger } from "../config/logger.js";
import { alertService } from "../services/AlertService.js";

interface ProviderHealth {
  providerId: string;
  providerName: string;
  isHealthy: boolean;
  issues: string[];
  metrics: {
    recentTransactions: number;
    successRate: number;
    avgResponseTime: number;
    lastTransaction?: Date;
  };
}

/**
 * Check health of all active providers
 */
async function checkProviderHealth(): Promise<void> {
  try {
    logger.info("Starting provider health check...");

    const providers = await ExternalProvider.find({ status: "active" });
    const unhealthyProviders: ProviderHealth[] = [];

    for (const provider of providers) {
      const health = await checkSingleProvider(provider);

      if (!health.isHealthy) {
        unhealthyProviders.push(health);

        // Disable provider if critical issues
        if (health.issues.length >= 3) {
          await ExternalProvider.findOneAndUpdate(
            { providerId: provider.providerId },
            {
              status: "disabled",
              disabledReason: `Auto-disabled: ${health.issues.join(", ")}`,
              disabledAt: new Date(),
            }
          );

          logger.warn(
            `Provider ${provider.name} auto-disabled due to health issues`
          );

          // Send alert
          await alertService.sendAlert({
            type: "provider_disabled",
            severity: "high",
            title: `Provider Disabled: ${provider.name}`,
            message: `Provider has been automatically disabled due to health issues: ${health.issues.join(
              ", "
            )}`,
            data: { providerId: provider.providerId, health },
          });
        } else {
          // Just send warning
          await alertService.sendAlert({
            type: "provider_unhealthy",
            severity: "medium",
            title: `Provider Health Warning: ${provider.name}`,
            message: `Provider showing health issues: ${health.issues.join(
              ", "
            )}`,
            data: { providerId: provider.providerId, health },
          });
        }
      }
    }

    logger.info(
      `Provider health check completed. ${unhealthyProviders.length}/${providers.length} providers unhealthy`
    );
  } catch (error) {
    logger.error("Error in provider health check job:", error);
  }
}

/**
 * Check health of a single provider
 */
async function checkSingleProvider(provider: any): Promise<ProviderHealth> {
  const issues: string[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check recent transaction volume
  const recentTransactions = await OfferWallTransaction.countDocuments({
    providerId: provider.providerId,
    createdAt: { $gte: oneDayAgo },
  });

  // Check success rate
  const allRecent = await OfferWallTransaction.find({
    providerId: provider.providerId,
    createdAt: { $gte: oneDayAgo },
  });

  const successfulRecent = allRecent.filter((t) => t.status === "completed");
  const successRate =
    allRecent.length > 0
      ? (successfulRecent.length / allRecent.length) * 100
      : 0;

  // Get last transaction
  const lastTransaction = await OfferWallTransaction.findOne({
    providerId: provider.providerId,
  })
    .sort({ createdAt: -1 })
    .select("createdAt");

  // Health checks
  if (recentTransactions === 0 && provider.metrics.totalCompletions > 10) {
    issues.push("No transactions in last 24 hours");
  }

  if (successRate < 50 && allRecent.length >= 10) {
    issues.push(`Low success rate: ${successRate.toFixed(1)}%`);
  }

  if (
    lastTransaction &&
    Date.now() - lastTransaction.createdAt.getTime() > 48 * 60 * 60 * 1000
  ) {
    issues.push("No transactions in last 48 hours");
  }

  // Check if provider metrics are stale
  if (
    provider.metrics.totalCompletions === 0 &&
    provider.createdAt < oneDayAgo
  ) {
    issues.push("No completions since activation");
  }

  return {
    providerId: provider.providerId,
    providerName: provider.name,
    isHealthy: issues.length === 0,
    issues,
    metrics: {
      recentTransactions,
      successRate,
      avgResponseTime: 0,
      lastTransaction: lastTransaction?.createdAt,
    },
  };
}

/**
 * Start the provider health check cron job
 */
export function startProviderHealthCheckJob(): void {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    await checkProviderHealth();
  });

  logger.info("Provider health check job scheduled (hourly)");

  // Run immediately on startup
  setTimeout(() => {
    checkProviderHealth();
  }, 5000);
}
