import { Request, Response } from "express";
import { platformSettingsService } from "../services/PlatformSettingsService.js";

/**
 * Get platform settings
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await platformSettingsService.getSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve settings",
    });
  }
};

/**
 * Update platform settings
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const adminId = (req as any).user?._id?.toString();

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Admin ID not found",
      });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.get("user-agent") || "unknown";

    await platformSettingsService.updateSettings(
      updates,
      adminId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: "Settings updated successfully and users notified",
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update settings",
    });
  }
};

/**
 * Reset settings to defaults
 */
export const resetSettings = async (req: Request, res: Response) => {
  try {
    const { settingKeys } = req.body;

    if (!settingKeys || !Array.isArray(settingKeys)) {
      return res.status(400).json({
        success: false,
        message: "settingKeys must be an array",
      });
    }

    const adminId = (req as any).user?._id?.toString();

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Admin ID not found",
      });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.get("user-agent") || "unknown";

    await platformSettingsService.resetToDefaults(
      settingKeys,
      adminId,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: "Settings reset to defaults successfully and users notified",
    });
  } catch (error: any) {
    console.error("Reset settings error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reset settings",
    });
  }
};

/**
 * Get settings audit log
 */
export const getAuditLog = async (req: Request, res: Response) => {
  try {
    const filters = {
      settingKey: req.query.settingKey as string,
      changedBy: req.query.changedBy as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await platformSettingsService.getAuditLog(filters);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get audit log error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve audit log",
    });
  }
};

/**
 * Export audit log to CSV
 */
export const exportAuditLog = async (req: Request, res: Response) => {
  try {
    const filters = {
      settingKey: req.query.settingKey as string,
      changedBy: req.query.changedBy as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      page: 1,
      limit: 10000, // Get all for export
    };

    const result = await platformSettingsService.getAuditLog(filters);

    // Convert to CSV
    const csvHeader =
      "Timestamp,Setting Key,Old Value,New Value,Changed By,IP Address\n";
    const csvRows = result.logs
      .map((log) => {
        const timestamp = new Date(log.timestamp).toISOString();
        const settingKey = log.settingKey;
        const oldValue = JSON.stringify(log.oldValue);
        const newValue = JSON.stringify(log.newValue);
        const changedBy = log.changedByName;
        const ipAddress = log.ipAddress;

        return `"${timestamp}","${settingKey}","${oldValue}","${newValue}","${changedBy}","${ipAddress}"`;
      })
      .join("\n");

    const csv = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="settings-audit-log-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error: any) {
    console.error("Export audit log error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to export audit log",
    });
  }
};
