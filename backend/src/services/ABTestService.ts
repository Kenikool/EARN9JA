import { TaskABTest, ITaskABTest } from "../models/TaskABTest.js";
import { Task } from "../models/Task.js";
import { TaskSubmission } from "../models/TaskSubmission.js";
import mongoose from "mongoose";

export class ABTestService {
  /**
   * Create A/B test
   */
  static async createABTest(
    sponsorId: string,
    testData: {
      testName: string;
      description?: string;
      variants: {
        name: string;
        taskId: string;
        trafficPercentage: number;
      }[];
      successMetric?:
        | "completion_rate"
        | "cost_per_completion"
        | "submission_rate";
      duration?: number;
      minSampleSize?: number;
      confidenceLevel?: 90 | 95 | 99;
      autoSelectWinner?: boolean;
    }
  ): Promise<ITaskABTest> {
    // Validate traffic split
    const totalTraffic = testData.variants.reduce(
      (sum, v) => sum + v.trafficPercentage,
      0
    );
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error("Traffic split must sum to 100%");
    }

    // Validate all tasks exist and belong to sponsor
    for (const variant of testData.variants) {
      const task = await Task.findById(variant.taskId);
      if (!task) {
        throw new Error(`Task ${variant.taskId} not found`);
      }
      if (task.sponsorId.toString() !== sponsorId) {
        throw new Error(`Task ${variant.taskId} does not belong to sponsor`);
      }
    }

    // Build traffic split map
    const trafficSplit: { [key: string]: number } = {};
    const variants = testData.variants.map((v, index) => {
      const variantId = `variant_${index + 1}`;
      trafficSplit[variantId] = v.trafficPercentage;
      return {
        variantId,
        name: v.name,
        taskId: new mongoose.Types.ObjectId(v.taskId),
        trafficPercentage: v.trafficPercentage,
        impressions: 0,
        submissions: 0,
        completions: 0,
        totalSpent: 0,
      };
    });

    const abTest = new TaskABTest({
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
      testName: testData.testName,
      description: testData.description,
      variants,
      trafficSplit,
      successMetric: testData.successMetric || "completion_rate",
      duration: testData.duration,
      minSampleSize: testData.minSampleSize || 100,
      confidenceLevel: testData.confidenceLevel || 95,
      autoSelectWinner: testData.autoSelectWinner ?? true,
      status: "draft",
    });

    return abTest.save();
  }

  /**
   * Get A/B test by ID
   */
  static async getABTest(testId: string): Promise<ITaskABTest | null> {
    return TaskABTest.findById(testId).populate("variants.taskId");
  }

  /**
   * Get sponsor A/B tests
   */
  static async getSponsorABTests(
    sponsorId: string,
    filters?: {
      status?: string;
    }
  ): Promise<ITaskABTest[]> {
    const query: any = {
      sponsorId: new mongoose.Types.ObjectId(sponsorId),
    };

    if (filters?.status) {
      query.status = filters.status;
    }

    return TaskABTest.find(query)
      .populate("variants.taskId")
      .sort({ createdAt: -1 });
  }

  /**
   * Start A/B test
   */
  static async startABTest(testId: string): Promise<ITaskABTest> {
    const abTest = await TaskABTest.findById(testId);
    if (!abTest) {
      throw new Error("A/B test not found");
    }

    if (abTest.status !== "draft") {
      throw new Error("Only draft tests can be started");
    }

    abTest.status = "running";
    abTest.startDate = new Date();
    if (abTest.duration) {
      abTest.endDate = new Date();
      abTest.endDate.setDate(abTest.endDate.getDate() + abTest.duration);
    }

    // Activate all variant tasks
    for (const variant of abTest.variants) {
      await Task.findByIdAndUpdate(variant.taskId, { status: "active" });
    }

    return abTest.save();
  }

  /**
   * Pause A/B test
   */
  static async pauseABTest(testId: string): Promise<ITaskABTest> {
    const abTest = await TaskABTest.findById(testId);
    if (!abTest) {
      throw new Error("A/B test not found");
    }

    abTest.status = "paused";

    // Pause all variant tasks
    for (const variant of abTest.variants) {
      await Task.findByIdAndUpdate(variant.taskId, { status: "paused" });
    }

    return abTest.save();
  }

  /**
   * Resume A/B test
   */
  static async resumeABTest(testId: string): Promise<ITaskABTest> {
    const abTest = await TaskABTest.findById(testId);
    if (!abTest) {
      throw new Error("A/B test not found");
    }

    if (abTest.status !== "paused") {
      throw new Error("Only paused tests can be resumed");
    }

    abTest.status = "running";

    // Resume all variant tasks
    for (const variant of abTest.variants) {
      await Task.findByIdAndUpdate(variant.taskId, { status: "active" });
    }

    return abTest.save();
  }

  /**
   * Update variant metrics
   */
  static async updateVariantMetrics(testId: string): Promise<ITaskABTest> {
    const abTest = await TaskABTest.findById(testId);
    if (!abTest) {
      throw new Error("A/B test not found");
    }

    // Update metrics for each variant
    for (const variant of abTest.variants) {
      const task = await Task.findById(variant.taskId);
      if (task) {
        const submissions = await TaskSubmission.countDocuments({
          taskId: variant.taskId,
        });
        const completions = await TaskSubmission.countDocuments({
          taskId: variant.taskId,
          status: "approved",
        });

        variant.submissions = submissions;
        variant.completions = completions;
        variant.totalSpent = completions * task.reward;
        // Note: impressions would need to be tracked separately
      }
    }

    // Check statistical significance
    await this.checkStatisticalSignificance(abTest);

    return abTest.save();
  }

  /**
   * Check statistical significance
   */
  private static async checkStatisticalSignificance(
    abTest: ITaskABTest
  ): Promise<void> {
    // Ensure minimum sample size is met
    const totalSamples = abTest.variants.reduce(
      (sum, v) => sum + v.submissions,
      0
    );
    if (totalSamples < abTest.minSampleSize) {
      return;
    }

    // Calculate metrics for each variant
    const variantMetrics = abTest.variants.map((v) => {
      let metricValue = 0;
      switch (abTest.successMetric) {
        case "completion_rate":
          metricValue = v.submissions > 0 ? v.completions / v.submissions : 0;
          break;
        case "submission_rate":
          metricValue = v.impressions > 0 ? v.submissions / v.impressions : 0;
          break;
        case "cost_per_completion":
          metricValue = v.completions > 0 ? v.totalSpent / v.completions : 0;
          break;
      }
      return {
        variantId: v.variantId,
        name: v.name,
        value: metricValue,
        sampleSize: v.submissions,
      };
    });

    // Find best and second best variants
    const sorted = [...variantMetrics].sort((a, b) => {
      // For cost_per_completion, lower is better
      if (abTest.successMetric === "cost_per_completion") {
        return a.value - b.value;
      }
      // For rates, higher is better
      return b.value - a.value;
    });

    const best = sorted[0];
    const secondBest = sorted[1];

    if (!best || !secondBest) {
      return;
    }

    // Calculate z-score for two proportions (simplified)
    const pValue = this.calculatePValue(best, secondBest, abTest.successMetric);
    const zScore = this.getZScore(abTest.confidenceLevel);
    const achieved = pValue < 1 - abTest.confidenceLevel / 100;

    abTest.statisticalSignificance = {
      achieved,
      pValue,
      confidenceInterval: abTest.confidenceLevel,
      winner: achieved ? best.variantId : undefined,
    };

    // Auto-select winner if enabled and significance achieved
    if (
      abTest.autoSelectWinner &&
      achieved &&
      !abTest.winnerSelected &&
      abTest.status === "running"
    ) {
      await this.selectWinner(abTest, best.variantId);
    }
  }

  /**
   * Calculate p-value (simplified chi-square test)
   */
  private static calculatePValue(
    variant1: any,
    variant2: any,
    metric: string
  ): number {
    // Simplified p-value calculation
    // In production, use a proper statistical library
    const diff = Math.abs(variant1.value - variant2.value);
    const pooled =
      (variant1.value * variant1.sampleSize +
        variant2.value * variant2.sampleSize) /
      (variant1.sampleSize + variant2.sampleSize);

    if (pooled === 0 || pooled === 1) {
      return 1;
    }

    const se = Math.sqrt(
      pooled *
        (1 - pooled) *
        (1 / variant1.sampleSize + 1 / variant2.sampleSize)
    );

    if (se === 0) {
      return 1;
    }

    const zScore = diff / se;

    // Approximate p-value from z-score
    return 1 - this.normalCDF(Math.abs(zScore));
  }

  /**
   * Get z-score for confidence level
   */
  private static getZScore(confidenceLevel: number): number {
    const zScores: { [key: number]: number } = {
      90: 1.645,
      95: 1.96,
      99: 2.576,
    };
    return zScores[confidenceLevel] || 1.96;
  }

  /**
   * Normal CDF approximation
   */
  private static normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  /**
   * Select winner
   */
  private static async selectWinner(
    abTest: ITaskABTest,
    winnerVariantId: string
  ): Promise<void> {
    abTest.winnerSelected = true;
    abTest.selectedWinner = winnerVariantId;
    abTest.winnerSelectedAt = new Date();
    abTest.status = "completed";

    // Pause losing variants
    for (const variant of abTest.variants) {
      if (variant.variantId !== winnerVariantId) {
        await Task.findByIdAndUpdate(variant.taskId, { status: "paused" });
      }
    }
  }

  /**
   * Manually select winner
   */
  static async selectWinnerManually(
    testId: string,
    winnerVariantId: string
  ): Promise<ITaskABTest> {
    const abTest = await TaskABTest.findById(testId);
    if (!abTest) {
      throw new Error("A/B test not found");
    }

    const variant = abTest.variants.find(
      (v) => v.variantId === winnerVariantId
    );
    if (!variant) {
      throw new Error("Variant not found");
    }

    await this.selectWinner(abTest, winnerVariantId);
    return abTest.save();
  }

  /**
   * Get A/B test results
   */
  static async getABTestResults(testId: string): Promise<any> {
    const abTest = await TaskABTest.findById(testId).populate(
      "variants.taskId"
    );
    if (!abTest) {
      throw new Error("A/B test not found");
    }

    // Update metrics before returning results
    await this.updateVariantMetrics(testId);

    const results = abTest.variants.map((variant) => {
      const completionRate =
        variant.submissions > 0 ? variant.completions / variant.submissions : 0;
      const submissionRate =
        variant.impressions > 0 ? variant.submissions / variant.impressions : 0;
      const costPerCompletion =
        variant.completions > 0 ? variant.totalSpent / variant.completions : 0;

      return {
        variantId: variant.variantId,
        name: variant.name,
        taskId: variant.taskId,
        trafficPercentage: variant.trafficPercentage,
        metrics: {
          impressions: variant.impressions,
          submissions: variant.submissions,
          completions: variant.completions,
          totalSpent: variant.totalSpent,
          completionRate,
          submissionRate,
          costPerCompletion,
        },
      };
    });

    return {
      testId: abTest._id,
      testName: abTest.testName,
      status: abTest.status,
      successMetric: abTest.successMetric,
      startDate: abTest.startDate,
      endDate: abTest.endDate,
      variants: results,
      statisticalSignificance: abTest.statisticalSignificance,
      winnerSelected: abTest.winnerSelected,
      selectedWinner: abTest.selectedWinner,
      winnerSelectedAt: abTest.winnerSelectedAt,
    };
  }

  /**
   * Get variant for traffic distribution
   */
  static async getVariantForUser(testId: string): Promise<string | null> {
    const abTest = await TaskABTest.findById(testId);
    if (!abTest || abTest.status !== "running") {
      return null;
    }

    // Simple random distribution based on traffic split
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of abTest.variants) {
      cumulative += variant.trafficPercentage;
      if (random <= cumulative) {
        return variant.taskId.toString();
      }
    }

    // Fallback to first variant
    return abTest.variants[0]?.taskId.toString() || null;
  }
}
