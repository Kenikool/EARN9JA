import { Request, Response } from "express";
import { urlValidationService } from "../services/UrlValidationService.js";

class ValidationController {
  /**
   * Validate URL
   */
  async validateUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url, platform } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          message: "URL is required",
        });
        return;
      }

      const result = urlValidationService.validate(url, platform);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("URL validation error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to validate URL",
      });
    }
  }

  /**
   * Auto-correct URL
   */
  async autoCorrectUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          message: "URL is required",
        });
        return;
      }

      const corrected = urlValidationService.autoCorrect(url);

      res.status(200).json({
        success: true,
        original: url,
        corrected,
      });
    } catch (error: any) {
      console.error("URL auto-correct error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to auto-correct URL",
      });
    }
  }

  /**
   * Get URL suggestions for a platform
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;

      if (!platform) {
        res.status(400).json({
          success: false,
          message: "Platform is required",
        });
        return;
      }

      const suggestions = urlValidationService.getSuggestions(platform);

      res.status(200).json({
        success: true,
        platform,
        suggestions,
      });
    } catch (error: any) {
      console.error("Get suggestions error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get suggestions",
      });
    }
  }
}

export const validationController = new ValidationController();
