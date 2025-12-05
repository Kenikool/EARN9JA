import { Request, Response } from "express";
import { currencyService } from "../services/CurrencyConversionService.js";
import { ExchangeRate } from "../models/ExchangeRate.js";
import { logger } from "../config/logger.js";

export class CurrencyController {
  /**
   * Convert amount from one currency to another
   * POST /api/currency/convert
   */
  async convert(req: Request, res: Response) {
    try {
      const { amount, from, to } = req.body;

      if (!amount || !from || !to) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: amount, from, to",
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      const converted = await currencyService.convert(amount, from, to);

      res.json({
        success: true,
        data: {
          original: {
            amount,
            currency: from,
          },
          converted: {
            amount: converted,
            currency: to,
          },
          rate: currencyService.getRate(from, to),
          timestamp: currencyService.getLastUpdate(),
        },
      });
    } catch (error: any) {
      logger.error("Currency conversion error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to convert currency",
      });
    }
  }

  /**
   * Convert multiple amounts at once
   * POST /api/currency/convert-batch
   */
  async convertBatch(req: Request, res: Response) {
    try {
      const { conversions } = req.body;

      if (!Array.isArray(conversions) || conversions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "conversions must be a non-empty array",
        });
      }

      const results = await currencyService.convertBatch(conversions);

      res.json({
        success: true,
        data: conversions.map((conv, index) => ({
          original: {
            amount: conv.amount,
            currency: conv.from,
          },
          converted: {
            amount: results[index],
            currency: conv.to,
          },
          rate: currencyService.getRate(conv.from, conv.to),
        })),
        timestamp: currencyService.getLastUpdate(),
      });
    } catch (error: any) {
      logger.error("Batch currency conversion error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to convert currencies",
      });
    }
  }

  /**
   * Get current exchange rates
   * GET /api/currency/rates
   */
  async getRates(req: Request, res: Response) {
    try {
      const rates = currencyService.getAllRates();
      const cacheStatus = currencyService.getCacheStatus();

      res.json({
        success: true,
        data: {
          rates,
          lastUpdate: cacheStatus.lastUpdate,
          isStale: cacheStatus.isStale,
          minutesUntilRefresh: cacheStatus.minutesUntilRefresh,
        },
      });
    } catch (error: any) {
      logger.error("Get rates error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get exchange rates",
      });
    }
  }

  /**
   * Get specific exchange rate
   * GET /api/currency/rate/:from/:to
   */
  async getRate(req: Request, res: Response) {
    try {
      const { from, to } = req.params;

      const rate = currencyService.getRate(
        from.toUpperCase(),
        to.toUpperCase()
      );

      if (rate === 0) {
        return res.status(404).json({
          success: false,
          message: `Exchange rate not found for ${from} to ${to}`,
        });
      }

      res.json({
        success: true,
        data: {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          rate,
          lastUpdate: currencyService.getLastUpdate(),
        },
      });
    } catch (error: any) {
      logger.error("Get rate error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get exchange rate",
      });
    }
  }

  /**
   * Get rate history
   * GET /api/currency/history/:from/:to?days=7
   */
  async getRateHistory(req: Request, res: Response) {
    try {
      const { from, to } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      if (days < 1 || days > 30) {
        return res.status(400).json({
          success: false,
          message: "days must be between 1 and 30",
        });
      }

      const history = await ExchangeRate.getRateHistory(from, to, days);

      res.json({
        success: true,
        data: {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          days,
          history: history.map((entry) => ({
            rate: entry.rate,
            timestamp: entry.timestamp,
          })),
        },
      });
    } catch (error: any) {
      logger.error("Get rate history error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get rate history",
      });
    }
  }

  /**
   * Force refresh exchange rates (admin only)
   * POST /api/currency/refresh
   */
  async forceRefresh(req: Request, res: Response) {
    try {
      await currencyService.forceRefresh();

      res.json({
        success: true,
        message: "Exchange rates refreshed successfully",
        data: {
          rates: currencyService.getAllRates(),
          lastUpdate: currencyService.getLastUpdate(),
        },
      });
    } catch (error: any) {
      logger.error("Force refresh error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to refresh exchange rates",
      });
    }
  }

  /**
   * Get cache status
   * GET /api/currency/status
   */
  async getCacheStatus(req: Request, res: Response) {
    try {
      const status = currencyService.getCacheStatus();

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      logger.error("Get cache status error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get cache status",
      });
    }
  }
}

export const currencyController = new CurrencyController();
