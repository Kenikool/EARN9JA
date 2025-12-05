import { Request, Response } from "express";
import { BulkTaskService } from "../services/BulkTaskService";

export class BulkController {
  /**
   * Upload and validate CSV
   * POST /api/bulk/validate
   */
  static async validateCSV(req: Request, res: Response) {
    try {
      const { csvContent } = req.body;

      if (!csvContent) {
        return res.status(400).json({
          success: false,
          message: "CSV content is required",
        });
      }

      // Parse CSV
      const parsedData = BulkTaskService.parseCSV(csvContent);

      // Validate data
      const { valid, errors } = BulkTaskService.validateBulkData(parsedData);

      res.status(200).json({
        success: true,
        data: {
          totalRows: parsedData.length,
          validRows: valid.length,
          invalidRows: errors.length,
          validData: valid,
          errors,
        },
      });
    } catch (error: any) {
      console.error("CSV validation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate CSV",
        error: error.message,
      });
    }
  }

  /**
   * Create tasks in bulk
   * POST /api/bulk/create
   */
  static async createBulkTasks(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { tasksData } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!tasksData || !Array.isArray(tasksData) || tasksData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tasks data is required",
        });
      }

      // Create tasks
      const result = await BulkTaskService.createBulkTasks(tasksData, userId);

      res.status(201).json({
        success: true,
        message: `Created ${result.successCount} tasks successfully`,
        data: result,
      });
    } catch (error: any) {
      console.error("Bulk creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tasks in bulk",
        error: error.message,
      });
    }
  }

  /**
   * Download CSV template
   * GET /api/bulk/template
   */
  static async downloadTemplate(req: Request, res: Response) {
    try {
      const template = BulkTaskService.generateCSVTemplate();

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=bulk-tasks-template.csv"
      );
      res.status(200).send(template);
    } catch (error: any) {
      console.error("Template download error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate template",
        error: error.message,
      });
    }
  }

  /**
   * Apply template with variables for bulk creation
   * POST /api/bulk/apply-template
   */
  static async applyTemplate(req: Request, res: Response) {
    try {
      const { templateData, variables } = req.body;

      if (!templateData || !variables || !Array.isArray(variables)) {
        return res.status(400).json({
          success: false,
          message: "Template data and variables array are required",
        });
      }

      const bulkData = BulkTaskService.applyTemplateVariables(
        templateData,
        variables
      );

      res.status(200).json({
        success: true,
        data: bulkData,
      });
    } catch (error: any) {
      console.error("Apply template error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to apply template",
        error: error.message,
      });
    }
  }
}
