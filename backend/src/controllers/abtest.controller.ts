import { Request, Response } from "express";
import { ABTestService } from "../services/ABTestService";

export class ABTestController {
  /**
   * Create A/B test
   * POST /api/abtests
   */
  static async createABTest(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const testData = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const abTest = await ABTestService.createABTest(userId, testData);

      res.status(201).json({
        success: true,
        message: "A/B test created successfully",
        data: abTest,
      });
    } catch (error: any) {
      console.error("Create A/B test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create A/B test",
        error: error.message,
      });
    }
  }

  /**
   * Get A/B test by ID
   * GET /api/abtests/:id
   */
  static async getABTest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const abTest = await ABTestService.getABTest(id);

      if (!abTest) {
        return res.status(404).json({
          success: false,
          message: "A/B test not found",
        });
      }

      res.status(200).json({
        success: true,
        data: abTest,
      });
    } catch (error: any) {
      console.error("Get A/B test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get A/B test",
        error: error.message,
      });
    }
  }

  /**
   * Get sponsor A/B tests
   * GET /api/abtests
   */
  static async getSponsorABTests(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { status } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const filters: any = {};
      if (status) filters.status = status as string;

      const abTests = await ABTestService.getSponsorABTests(userId, filters);

      res.status(200).json({
        success: true,
        data: abTests,
      });
    } catch (error: any) {
      console.error("Get sponsor A/B tests error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get A/B tests",
        error: error.message,
      });
    }
  }

  /**
   * Start A/B test
   * POST /api/abtests/:id/start
   */
  static async startABTest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const abTest = await ABTestService.startABTest(id);

      res.status(200).json({
        success: true,
        message: "A/B test started successfully",
        data: abTest,
      });
    } catch (error: any) {
      console.error("Start A/B test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start A/B test",
        error: error.message,
      });
    }
  }

  /**
   * Pause A/B test
   * POST /api/abtests/:id/pause
   */
  static async pauseABTest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const abTest = await ABTestService.pauseABTest(id);

      res.status(200).json({
        success: true,
        message: "A/B test paused successfully",
        data: abTest,
      });
    } catch (error: any) {
      console.error("Pause A/B test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to pause A/B test",
        error: error.message,
      });
    }
  }

  /**
   * Resume A/B test
   * POST /api/abtests/:id/resume
   */
  static async resumeABTest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const abTest = await ABTestService.resumeABTest(id);

      res.status(200).json({
        success: true,
        message: "A/B test resumed successfully",
        data: abTest,
      });
    } catch (error: any) {
      console.error("Resume A/B test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resume A/B test",
        error: error.message,
      });
    }
  }

  /**
   * Select winner manually
   * POST /api/abtests/:id/select-winner
   */
  static async selectWinner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { winnerVariantId } = req.body;

      if (!winnerVariantId) {
        return res.status(400).json({
          success: false,
          message: "Winner variant ID is required",
        });
      }

      const abTest = await ABTestService.selectWinnerManually(
        id,
        winnerVariantId
      );

      res.status(200).json({
        success: true,
        message: "Winner selected successfully",
        data: abTest,
      });
    } catch (error: any) {
      console.error("Select winner error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to select winner",
        error: error.message,
      });
    }
  }

  /**
   * Get A/B test results
   * GET /api/abtests/:id/results
   */
  static async getResults(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const results = await ABTestService.getABTestResults(id);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      console.error("Get A/B test results error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get A/B test results",
        error: error.message,
      });
    }
  }

  /**
   * Get variant for user (traffic distribution)
   * GET /api/abtests/:id/variant
   */
  static async getVariant(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const taskId = await ABTestService.getVariantForUser(id);

      res.status(200).json({
        success: true,
        data: { taskId },
      });
    } catch (error: any) {
      console.error("Get variant error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get variant",
        error: error.message,
      });
    }
  }
}
