import axios from "axios";
import { logger } from "../config/logger.js";
import { AlertService } from "./AlertService.js";
import { ExchangeRate } from "../models/ExchangeRate.js";

interface ExchangeRates {
  USD_NGN: number;
  EUR_NGN: number;
  GBP_NGN: number;
}

interface RateHistory {
  rate: number;
  timestamp: Date;
}

export class CurrencyConversionService {
  private exchangeRates: Map<string, number> = new Map();
  private rateHistory: Map<string, RateHistory[]> = new Map();
  private lastUpdate: Date | null = null;
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
  private readonly FLUCTUATION_THRESHOLD = 0.05; // 5%
  private readonly API_URL = "https://api.exchangerate-api.com/v4/latest/USD";
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
    this.loadRatesFromDatabase();
  }

  /**
   * Load latest rates from database on startup
   */
  private async loadRatesFromDatabase(): Promise<void> {
    try {
      const usdRate = await ExchangeRate.getLatestRate("USD", "NGN");
      const eurRate = await ExchangeRate.getLatestRate("EUR", "NGN");
      const gbpRate = await ExchangeRate.getLatestRate("GBP", "NGN");

      if (usdRate) {
        this.exchangeRates.set("USD_NGN", usdRate.rate);
        this.lastUpdate = usdRate.timestamp;
      }
      if (eurRate) {
        this.exchangeRates.set("EUR_NGN", eurRate.rate);
      }
      if (gbpRate) {
        this.exchangeRates.set("GBP_NGN", gbpRate.rate);
      }

      if (usdRate || eurRate || gbpRate) {
        logger.info("Loaded exchange rates from database", {
          USD_NGN: usdRate?.rate.toFixed(2),
          EUR_NGN: eurRate?.rate.toFixed(2),
          GBP_NGN: gbpRate?.rate.toFixed(2),
        });
      }
    } catch (error) {
      logger.error("Failed to load rates from database:", error);
    }
  }

  /**
   * Update exchange rates from external API
   */
  async updateExchangeRates(): Promise<void> {
    try {
      const response = await axios.get(this.API_URL, {
        timeout: 10000,
      });

      if (!response.data || !response.data.rates) {
        throw new Error("Invalid response from exchange rate API");
      }

      const rates = response.data.rates;

      // Calculate NGN rates
      const usdToNgn = rates.NGN;
      const eurToNgn = rates.NGN / rates.EUR;
      const gbpToNgn = rates.NGN / rates.GBP;

      // Check for significant fluctuations before updating
      await this.checkFluctuations("USD_NGN", usdToNgn);
      await this.checkFluctuations("EUR_NGN", eurToNgn);
      await this.checkFluctuations("GBP_NGN", gbpToNgn);

      // Update rates
      this.exchangeRates.set("USD_NGN", usdToNgn);
      this.exchangeRates.set("EUR_NGN", eurToNgn);
      this.exchangeRates.set("GBP_NGN", gbpToNgn);

      // Store in history
      this.addToHistory("USD_NGN", usdToNgn);
      this.addToHistory("EUR_NGN", eurToNgn);
      this.addToHistory("GBP_NGN", gbpToNgn);

      // Persist to database
      await Promise.all([
        ExchangeRate.saveRate("USD", "NGN", usdToNgn, {
          apiResponse: response.data,
        }),
        ExchangeRate.saveRate("EUR", "NGN", eurToNgn, {
          apiResponse: response.data,
        }),
        ExchangeRate.saveRate("GBP", "NGN", gbpToNgn, {
          apiResponse: response.data,
        }),
      ]);

      this.lastUpdate = new Date();

      logger.info("Exchange rates updated successfully", {
        USD_NGN: usdToNgn.toFixed(2),
        EUR_NGN: eurToNgn.toFixed(2),
        GBP_NGN: gbpToNgn.toFixed(2),
        timestamp: this.lastUpdate,
      });
    } catch (error) {
      logger.error("Failed to update exchange rates:", error);
      throw new Error("Currency conversion service unavailable");
    }
  }

  /**
   * Check if rate has fluctuated beyond threshold
   */
  private async checkFluctuations(
    rateKey: string,
    newRate: number
  ): Promise<void> {
    const currentRate = this.exchangeRates.get(rateKey);

    if (!currentRate) return;

    const percentageChange = Math.abs((newRate - currentRate) / currentRate);

    if (percentageChange > this.FLUCTUATION_THRESHOLD) {
      const changePercent = (percentageChange * 100).toFixed(2);
      const direction = newRate > currentRate ? "increased" : "decreased";

      logger.warn(`Exchange rate fluctuation detected for ${rateKey}`, {
        oldRate: currentRate.toFixed(2),
        newRate: newRate.toFixed(2),
        change: `${changePercent}%`,
        direction,
      });

      // Send alert to admins
      await this.alertService.sendAlert({
        type: "exchange_rate_fluctuation",
        severity: "warning",
        title: `Exchange Rate Alert: ${rateKey}`,
        message: `${rateKey} has ${direction} by ${changePercent}% (from ${currentRate.toFixed(
          2
        )} to ${newRate.toFixed(2)})`,
        metadata: {
          rateKey,
          oldRate: currentRate,
          newRate,
          percentageChange: changePercent,
        },
      });
    }
  }

  /**
   * Add rate to history for tracking
   */
  private addToHistory(rateKey: string, rate: number): void {
    if (!this.rateHistory.has(rateKey)) {
      this.rateHistory.set(rateKey, []);
    }

    const history = this.rateHistory.get(rateKey)!;
    history.push({
      rate,
      timestamp: new Date(),
    });

    // Keep only last 30 days of history
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.rateHistory.set(
      rateKey,
      history.filter((entry) => entry.timestamp > thirtyDaysAgo)
    );
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Ensure rates are up to date
    if (this.shouldUpdateRates()) {
      await this.updateExchangeRates();
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = this.exchangeRates.get(rateKey);

    if (!rate) {
      throw new Error(
        `Exchange rate not available for ${fromCurrency} to ${toCurrency}`
      );
    }

    // Convert and round to 2 decimal places
    const converted = amount * rate;
    return Math.round(converted * 100) / 100;
  }

  /**
   * Convert multiple amounts at once
   */
  async convertBatch(
    conversions: Array<{
      amount: number;
      from: string;
      to: string;
    }>
  ): Promise<number[]> {
    // Ensure rates are up to date
    if (this.shouldUpdateRates()) {
      await this.updateExchangeRates();
    }

    return conversions.map(({ amount, from, to }) => {
      if (from === to) return amount;

      const rateKey = `${from}_${to}`;
      const rate = this.exchangeRates.get(rateKey);

      if (!rate) {
        throw new Error(`Exchange rate not available for ${from} to ${to}`);
      }

      const converted = amount * rate;
      return Math.round(converted * 100) / 100;
    });
  }

  /**
   * Get current exchange rate
   */
  getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1;

    const rateKey = `${fromCurrency}_${toCurrency}`;
    return this.exchangeRates.get(rateKey) || 0;
  }

  /**
   * Get all current rates
   */
  getAllRates(): ExchangeRates {
    return {
      USD_NGN: this.exchangeRates.get("USD_NGN") || 0,
      EUR_NGN: this.exchangeRates.get("EUR_NGN") || 0,
      GBP_NGN: this.exchangeRates.get("GBP_NGN") || 0,
    };
  }

  /**
   * Get rate history for a currency pair
   */
  getRateHistory(
    fromCurrency: string,
    toCurrency: string,
    days: number = 7
  ): RateHistory[] {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    const history = this.rateHistory.get(rateKey) || [];

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return history.filter((entry) => entry.timestamp > cutoffDate);
  }

  /**
   * Get last update timestamp
   */
  getLastUpdate(): Date | null {
    return this.lastUpdate;
  }

  /**
   * Check if rates should be updated
   */
  private shouldUpdateRates(): boolean {
    if (!this.lastUpdate) return true;

    const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
    return timeSinceUpdate > this.CACHE_DURATION;
  }

  /**
   * Force refresh rates (bypass cache)
   */
  async forceRefresh(): Promise<void> {
    logger.info("Forcing exchange rate refresh");
    await this.updateExchangeRates();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    lastUpdate: Date | null;
    isStale: boolean;
    minutesUntilRefresh: number;
  } {
    const isStale = this.shouldUpdateRates();
    let minutesUntilRefresh = 0;

    if (this.lastUpdate && !isStale) {
      const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
      const timeUntilRefresh = this.CACHE_DURATION - timeSinceUpdate;
      minutesUntilRefresh = Math.ceil(timeUntilRefresh / (60 * 1000));
    }

    return {
      lastUpdate: this.lastUpdate,
      isStale,
      minutesUntilRefresh,
    };
  }
}

// Export singleton instance
export const currencyService = new CurrencyConversionService();
