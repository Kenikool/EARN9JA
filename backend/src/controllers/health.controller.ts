import { Request, Response } from "express";
import { healthCheckService } from "../services/HealthCheckService.js";

/**
 * Get system health status
 */
export const getHealthStatus = async (req: Request, res: Response) => {
  try {
    const healthCheck = await healthCheckService.performHealthCheck();

    const statusCode = healthCheck.overall === "healthy" ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: healthCheck,
    });
  } catch (error: unknown) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Health check failed",
    });
  }
};

/**
 * Get system metrics
 */
export const getSystemMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = healthCheckService.getSystemMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    console.error("System metrics error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get system metrics",
    });
  }
};
