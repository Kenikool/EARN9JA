import api from "./authService";

export interface AppVersion {
  _id: string;
  platform: "android" | "ios";
  latestVersion: string;
  minVersion: string;
  downloadUrl: string;
  releaseNotes: string[];
  releaseDate: string;
  updateRequired: boolean;
  publishedBy: any;
  publishedAt: string;
  isActive: boolean;
}

export interface VersionConfig {
  platform: "android" | "ios";
  latestVersion: string;
  minVersion: string;
  downloadUrl: string;
  releaseNotes: string[];
  updateRequired: boolean;
}

export interface VersionAnalytics {
  versionDistribution: Array<{
    version: string;
    count: number;
    percentage: number;
  }>;
  adoptionRate: number;
  totalUsers: number;
  usersOnLatest: number;
}

export const versionService = {
  async getAllVersions(
    platform?: "android" | "ios"
  ): Promise<{ success: boolean; data: AppVersion[] }> {
    const params = platform ? `?platform=${platform}` : "";
    const response = await api.get(`/admin/versions${params}`);
    return response.data;
  },

  async updateVersionConfig(
    config: VersionConfig
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/admin/versions", config);
    return response.data;
  },

  async getVersionAnalytics(filters: {
    platform?: "android" | "ios";
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: VersionAnalytics }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    const response = await api.get(`/admin/versions/analytics?${params}`);
    return response.data;
  },
};

export default versionService;
