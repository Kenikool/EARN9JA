/**
 * Comprehensive Integration Tests for Offer Wall System
 * Tests all major components: providers, postbacks, fraud prevention, analytics
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";
import { ExternalProvider } from "../src/models/ExternalProvider.js";
import { OfferWallTransaction } from "../src/models/OfferWallTransaction.js";
import { User } from "../src/models/User.js";
import { Wallet } from "../src/models/Wallet.js";
import { currencyService } from "../src/services/CurrencyConversionService.js";
import { postbackWebhookService } from "../src/services/PostbackWebhookService.js";
import { fraudPreventionService } from "../src/services/FraudPreventionService.js";
import { offerWallAnalyticsService } from "../src/services/OfferWallAnalyticsService.js";

describe("Offer Wall Integration Tests", () => {
  let testUser: any;
  let testProvider: any;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/earn9ja-test"
    );

    // Create test user
    testUser = await User.create({
      email: "test@example.com",
      password: "hashedpassword",
      firstName: "Test",
      lastName: "User",
      role: "worker",
    });

    // Create test wallet
    await Wallet.create({
      userId: testUser._id,
      availableBalance: 0,
      lifetimeEarnings: 0,
    });

    // Create test provider
    testProvider = await ExternalProvider.create({
      providerId: "test-provider",
      name: "Test Provider",
      providerType: "OFFER_WALL",
      category: "GENERAL",
      apiEndpoint: "https://test.com",
      apiKey: "test-key",
      status: "active",
      commissionRate: 0.2,
      supportedCurrencies: ["USD"],
    });
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await ExternalProvider.deleteMany({});
    await OfferWallTransaction.deleteMany({});
    await mongoose.disconnect();
  });

  describe("Currency Conversion Service", () => {
    it("should convert USD to NGN", async () => {
      const result = await currencyService.convert(10, "USD", "NGN");
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
    });

    it("should return same amount for same currency", async () => {
      const result = await currencyService.convert(100, "NGN", "NGN");
      expect(result).toBe(100);
    });

    it("should cache exchange rates", async () => {
      const rate1 = currencyService.getRate("USD", "NGN");
      const rate2 = currencyService.getRate("USD", "NGN");
      expect(rate1).toBe(rate2);
    });
  });

  describe("Postback Webhook Service", () => {
    it("should process valid postback", async () => {
      const postbackData = {
        userId: testUser._id.toString(),
        transactionId: `test-${Date.now()}`,
        amount: 1.5,
        currency: "USD",
        offerName: "Test Offer",
        offerCategory: "general",
        providerId: testProvider.providerId,
        providerName: testProvider.name,
      };

      const result = await postbackWebhookService.processPostback(
        postbackData,
        "127.0.0.1",
        "test-agent"
      );

      expect(result.success).toBe(true);
      expect(result.userEarnings).toBeGreaterThan(0);
    });

    it("should reject duplicate transactions", async () => {
      const transactionId = `duplicate-${Date.now()}`;

      const postbackData = {
        userId: testUser._id.toString(),
        transactionId,
        amount: 1.0,
        currency: "USD",
        offerName: "Duplicate Test",
        offerCategory: "general",
        providerId: testProvider.providerId,
        providerName: testProvider.name,
      };

      // First attempt
      await postbackWebhookService.processPostback(
        postbackData,
        "127.0.0.1",
        "test-agent"
      );

      // Second attempt (should fail)
      const result = await postbackWebhookService.processPostback(
        postbackData,
        "127.0.0.1",
        "test-agent"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("FRAUD_DETECTED");
    });

    it("should credit user wallet correctly", async () => {
      const initialWallet = await Wallet.findOne({ userId: testUser._id });
      const initialBalance = initialWallet?.availableBalance || 0;

      const postbackData = {
        userId: testUser._id.toString(),
        transactionId: `wallet-test-${Date.now()}`,
        amount: 2.0,
        currency: "USD",
        offerName: "Wallet Test",
        offerCategory: "general",
        providerId: testProvider.providerId,
        providerName: testProvider.name,
      };

      await postbackWebhookService.processPostback(
        postbackData,
        "127.0.0.1",
        "test-agent"
      );

      const updatedWallet = await Wallet.findOne({ userId: testUser._id });
      expect(updatedWallet?.availableBalance).toBeGreaterThan(initialBalance);
    });
  });

  describe("Fraud Prevention Service", () => {
    it("should detect duplicate transactions", async () => {
      const transactionId = `fraud-test-${Date.now()}`;

      const duplicateCheck = await fraudPreventionService.checkDuplicate(
        transactionId,
        testUser._id.toString(),
        100,
        testProvider.providerId
      );

      expect(duplicateCheck.isDuplicate).toBe(false);
    });

    it("should calculate risk score", async () => {
      const riskScore = await fraudPreventionService.calculateRiskScore(
        testUser._id.toString()
      );

      expect(typeof riskScore).toBe("number");
      expect(riskScore).toBeGreaterThanOrEqual(0);
      expect(riskScore).toBeLessThanOrEqual(100);
    });

    it("should analyze user activity", async () => {
      const activity = await fraudPreventionService.analyzeUserActivity(
        testUser._id.toString()
      );

      expect(activity).toHaveProperty("userId");
      expect(activity).toHaveProperty("completionsLast24h");
      expect(activity).toHaveProperty("suspiciousPatterns");
    });

    it("should enforce rate limiting", async () => {
      const rateLimitCheck = await fraudPreventionService.checkRateLimit(
        testUser._id.toString()
      );

      expect(rateLimitCheck).toHaveProperty("allowed");
      expect(typeof rateLimitCheck.allowed).toBe("boolean");
    });
  });

  describe("Analytics Service", () => {
    it("should get provider analytics", async () => {
      const analytics = await offerWallAnalyticsService.getProviderAnalytics(
        testProvider.providerId
      );

      expect(analytics).toHaveProperty("providerId");
      expect(analytics).toHaveProperty("totalCompletions");
      expect(analytics).toHaveProperty("totalRevenue");
      expect(analytics).toHaveProperty("totalCommission");
    });

    it("should generate revenue report", async () => {
      const report = await offerWallAnalyticsService.generateRevenueReport();

      expect(report).toHaveProperty("period");
      expect(report).toHaveProperty("totalRevenue");
      expect(report).toHaveProperty("byProvider");
      expect(report).toHaveProperty("byCategory");
      expect(report).toHaveProperty("byDay");
      expect(Array.isArray(report.byProvider)).toBe(true);
    });

    it("should compare providers", async () => {
      const comparison = await offerWallAnalyticsService.compareProviders();

      expect(Array.isArray(comparison)).toBe(true);
    });
  });

  describe("Provider Management", () => {
    it("should create provider", async () => {
      const provider = await ExternalProvider.create({
        providerId: "new-test-provider",
        name: "New Test Provider",
        providerType: "OFFER_WALL",
        category: "GENERAL",
        apiEndpoint: "https://newtest.com",
        apiKey: "new-test-key",
        status: "active",
        commissionRate: 0.15,
        supportedCurrencies: ["USD"],
      });

      expect(provider.providerId).toBe("new-test-provider");
      expect(provider.commissionRate).toBe(0.15);
    });

    it("should update provider status", async () => {
      await ExternalProvider.findOneAndUpdate(
        { providerId: testProvider.providerId },
        { status: "inactive" }
      );

      const updated = await ExternalProvider.findOne({
        providerId: testProvider.providerId,
      });

      expect(updated?.status).toBe("inactive");

      // Restore status
      await ExternalProvider.findOneAndUpdate(
        { providerId: testProvider.providerId },
        { status: "active" }
      );
    });
  });

  describe("Transaction Model", () => {
    it("should find transaction by external ID", async () => {
      const transaction = await OfferWallTransaction.create({
        userId: testUser._id,
        providerId: testProvider.providerId,
        providerName: testProvider.name,
        externalTransactionId: `model-test-${Date.now()}`,
        offerName: "Model Test",
        offerCategory: "general",
        originalAmount: 1.0,
        originalCurrency: "USD",
        convertedAmount: 1500,
        commissionRate: 0.2,
        commissionAmount: 300,
        userEarnings: 1200,
        status: "completed",
        postbackData: {},
      });

      const found = await OfferWallTransaction.findByExternalId(
        transaction.externalTransactionId
      );

      expect(found).toBeTruthy();
      expect(found?.externalTransactionId).toBe(
        transaction.externalTransactionId
      );
    });

    it("should get user transactions", async () => {
      const transactions = await OfferWallTransaction.getUserTransactions(
        testUser._id.toString(),
        10
      );

      expect(Array.isArray(transactions)).toBe(true);
    });

    it("should get provider stats", async () => {
      const stats = await OfferWallTransaction.getProviderStats(
        testProvider.providerId
      );

      expect(stats).toHaveProperty("totalTransactions");
      expect(stats).toHaveProperty("totalRevenue");
      expect(stats).toHaveProperty("totalCommission");
    });
  });
});

export {};
