import api from "./authService";

export interface ServiceStatus {
  status: "operational" | "degraded" | "down";
  message?: string;
  responseTime?: number;
}

export interface HealthCheckData {
  api: ServiceStatus;
  database: ServiceStatus;
  firebase: ServiceStatus;
  overall: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    total: number;
    used: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  nodeVersion: string;
  platform: string;
}

export const healthService = {
  async getHealthStatus(): Promise<{
    success: boolean;
    data: HealthCheckData;
  }> {
    const response = await api.get("/health");
    return response.data;
  },

  async getSystemMetrics(): Promise<{
    success: boolean;
    data: SystemMetrics;
  }> {
    const response = await api.get("/health/metrics");
    return response.data;
  },
};

export default healthService;
