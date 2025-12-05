import { Request, Response } from "express";
import { RequirementService } from "../services/RequirementService";

export class RequirementController {
  /**
   * Get requirement suggestions
   * GET /api/requirements/suggestions
   */
  static async getSuggestions(req: Request, res: Response) {
    try {
      const { category, platform, popularOnly, limit } = req.query;

      const suggestions = RequirementService.getSuggestions({
        category: category as string,
        platform: platform as string,
        popularOnly: popularOnly === "true",
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      console.error("Get suggestions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get suggestions",
        error: error.message,
      });
    }
  }

  /**
   * Get requirement by ID
   * GET /api/requirements/:id
   */
  static async getRequirementById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const requirement = RequirementService.getRequirementById(id);

      if (!requirement) {
        return res.status(404).json({
          success: false,
          message: "Requirement not found",
        });
      }

      res.status(200).json({
        success: true,
        data: requirement,
      });
    } catch (error: any) {
      console.error("Get requirement error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get requirement",
        error: error.message,
      });
    }
  }

  /**
   * Calculate difficulty impact
   * POST /api/requirements/difficulty
   */
  static async calculateDifficulty(req: Request, res: Response) {
    try {
      const { requirements } = req.body;

      if (!Array.isArray(requirements)) {
        return res.status(400).json({
          success: false,
          message: "Requirements must be an array",
        });
      }

      const result = RequirementService.calculateDifficultyImpact(requirements);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Calculate difficulty error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate difficulty",
        error: error.message,
      });
    }
  }

  /**
   * Get additional requirement suggestions
   * POST /api/requirements/suggest-more
   */
  static async suggestMore(req: Request, res: Response) {
    try {
      const { currentRequirements, category, platform } = req.body;

      if (!Array.isArray(currentRequirements) || !category) {
        return res.status(400).json({
          success: false,
          message: "Current requirements and category are required",
        });
      }

      const suggestions = RequirementService.suggestAdditionalRequirements(
        currentRequirements,
        category,
        platform
      );

      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      console.error("Suggest more error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to suggest more requirements",
        error: error.message,
      });
    }
  }

  /**
   * Get categories
   * GET /api/requirements/categories
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = RequirementService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      console.error("Get categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get categories",
        error: error.message,
      });
    }
  }

  /**
   * Get platforms for category
   * GET /api/requirements/platforms/:category
   */
  static async getPlatforms(req: Request, res: Response) {
    try {
      const { category } = req.params;

      const platforms = RequirementService.getPlatformsForCategory(category);

      res.status(200).json({
        success: true,
        data: platforms,
      });
    } catch (error: any) {
      console.error("Get platforms error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get platforms",
        error: error.message,
      });
    }
  }
}
