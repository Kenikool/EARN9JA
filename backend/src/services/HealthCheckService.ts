import mongoose from "mongoose";
import admin from "firebase-admin";

interface ServiceStatus {
  status: "operational" | "degraded" | "down";
  message?: string;
  responseTime?: number;
}

interface HealthCheckResult {
  api: ServiceStatus;
  database: ServiceStatus;
  firebase: ServiceStatus;
  overall: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  uptime: number;
}

export class HealthCheckService {
  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const state = mongoose.connection.readyState;
      const responseTime = Date.now() - startTime;

      if (state === 1) {
        // Connected
        return {
          status: "operational",
          message: "Database connected",
          responseTime,
        };
      } else if (state === 2) {
        // Connecting
        return {
          status: "degraded",
          message: "Database connecting",
          responseTime,
        };
      } else {
        return {
          status: "down",
          message: "Database disconnected",
          responseTime,
        };
      }
    } catch (error) {
      return {
        status: "down",
        message: error instanceof Error ? error.message : "Database error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check Firebase connectivity
   */
  private async checkFirebase(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      // Try to get Firebase app instance
      const app = admin.app();
      const responseTime = Date.now() - startTime;

      if (app) {
        return {
          status: "operational",
          message: "Firebase connected",
          responseTime,
        };
      } else {
        return {
          status: "down",
          message: "Firebase not initialized",
          responseTime,
        };
      }
    } catch (error) {
      return {
        status: "down",
        message: error instanceof Error ? error.message : "Firebase error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check API server status
   */
  private checkAPI(): ServiceStatus {
    return {
      status: "operational",
      message: "API server running",
      responseTime: 0,
    };
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const [api, database, firebase] = await Promise.all([
      Promise.resolve(this.checkAPI()),
      this.checkDatabase(),
      this.checkFirebase(),
    ]);

    // Determine overall health
    let overall: "healthy" | "degraded" | "unhealthy" = "healthy";

    const statuses = [api.status, database.status, firebase.status];

    if (statuses.includes("down")) {
      overall = "unhealthy";
    } else if (statuses.includes("degraded")) {
      overall = "degraded";
    }

    return {
      api,
      database,
      firebase,
      overall,
      timestamp: new Date(),
      uptime: process.uptime(),
    };
  }

  /**
   * Get system metrics
   */
  getSystemMetrics() {
    const memoryUsage = process.memoryUsage();

    return {
      uptime: process.uptime(),
      memory: {
        total: memoryUsage.heapTotal,
        used: memoryUsage.heapUsed,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }
}

export const healthCheckService = new HealthCheckService();
