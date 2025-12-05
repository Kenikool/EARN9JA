import { Request, Response } from "express";
import { PreviewService } from "../services/PreviewService.js";

export class PreviewController {
  /**
   * Generate task preview
   * POST /api/preview
   */
  static async generatePreview(req: Request, res: Response) {
    try {
      const taskData = req.body;

      if (!taskData.title || !taskData.description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      const preview = PreviewService.generatePreview(taskData);

      res.status(201).json({
        success: true,
        data: preview,
      });
    } catch (error: any) {
      console.error("Generate preview error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate preview",
        error: error.message,
      });
    }
  }

  /**
   * Get preview by ID
   * GET /api/preview/:previewId
   */
  static async getPreview(req: Request, res: Response) {
    try {
      const { previewId } = req.params;
      const { userType } = req.query;

      const preview = PreviewService.getPreview(previewId);

      if (!preview) {
        return res.status(404).json({
          success: false,
          message: "Preview not found or expired",
        });
      }

      // Simulate worker view
      const workerView = PreviewService.simulateWorkerView(
        preview,
        (userType as "new" | "experienced") || "new"
      );

      res.status(200).json({
        success: true,
        data: workerView,
      });
    } catch (error: any) {
      console.error("Get preview error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get preview",
        error: error.message,
      });
    }
  }

  /**
   * Delete preview
   * DELETE /api/preview/:previewId
   */
  static async deletePreview(req: Request, res: Response) {
    try {
      const { previewId } = req.params;

      const deleted = PreviewService.deletePreview(previewId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Preview not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Preview deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete preview error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete preview",
        error: error.message,
      });
    }
  }
}
