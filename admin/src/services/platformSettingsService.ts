import api from "./authService";

export interface PlatformSettings {
  _id: string;
  financial: {
    minimumWithdrawal: number;
    platformCommissionRate: number;
    referralBonusAmount: number;
    minimumTaskReward: number;
  };
  userLimits: {
    maxActiveTasksPerUser: number;
    maxSubmissionsPerTask: number;
    dailySpinLimit: number;
  };
  operational: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    kycRequired: boolean;
  };
  taskManagement: {
    approvalAutoTimeoutDays: number;
    maxTaskDurationDays: number;
  };
  lastModified: string;
  lastModifiedBy?: string;
  version: number;
}

export interface SettingsAuditLog {
  _id: string;
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface AuditLogFilters {
  settingKey?: string;
  changedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const platformSettingsService = {
  async getSettings(): Promise<{ success: boolean; data: PlatformSettings }> {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  async updateSettings(
    updates: Partial<PlatformSettings>
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch("/admin/settings", updates);
    return response.data;
  },

  async resetSettings(
    settingKeys: string[]
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/admin/settings/reset", { settingKeys });
    return response.data;
  },

  async getAuditLog(filters: AuditLogFilters = {}): Promise<{
    success: boolean;
    data: {
      logs: SettingsAuditLog[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    const response = await api.get(`/admin/settings/audit?${params}`);
    return {
      success: response.data.success,
      data: {
        logs: response.data.data,
        pagination: response.data.pagination,
      },
    };
  },

  async exportAuditLog(filters: AuditLogFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    const response = await api.get(`/admin/settings/audit/export?${params}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export default platformSettingsService;
