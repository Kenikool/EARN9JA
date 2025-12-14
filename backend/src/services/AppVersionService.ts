import { AppVersion, IAppVersion } from "../models/AppVersion.js";
import { VersionCheckLog } from "../models/VersionCheckLog.js";
import Redis from "redis";
import mongoose from "mongoose";

const CACHE_KEY_PREFIX = "app:version:";
const CACHE_TTL = 86400; // 24 hours

interface VersionInfo {
  latestVersion: string;
  minVersion: string;
  downloadUrl: string;
  releaseNotes: string[];
  releaseDate: Date;
  updateRequired: boolean;
}

interface UpdateRequired {
  updateAvailable: boolean;
  updateRequired: boolean;
  versionInfo?: VersionInfo;
}

interface VersionConfig {
  platform: "android" | "ios";
  latestVersion: string;
  minVersion: string;
  downloadUrl: string;
  releaseNotes: string[];
  updateRequired: boolean;
}

interface AnalyticsFilters {
  platform?: "android" | "ios";
  startDate?: Date;
  endDate?: Date;
}

interface VersionAnalytics {
  versionDistribution: Array<{
    version: string;
    count: number;
    percentage: number;
  }>;
  adoptionRate: number;
  totalUsers: number;
  usersOnLatest: number;
}

class AppVersionService {
  private redisClient: any;

  constructor() {
    // Initialize Redis client if available
    if (process.env.REDIS_URL) {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
      });
      this.redisClient.connect().catch((err: any) => {
        console.error("Redis connection error:", err);
        this.redisClient = null;
      });
    }
  }

  /**
   * Get version info for a platform (with caching)
   */
  async getVersionInfo(platform: "ios" | "android"): Promise<VersionInfo> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${platform}:v1`;

      // Try cache first
      if (this.redisClient) {
        try {
          const cached = await this.redisClient.get(cacheKey);
          if (cached) {
            console.log(`📦 Version info retrieved from cache for ${platform}`);
            return JSON.parse(cached);
          }
        } catch (cacheError) {
          console.error("Cache read error:", cacheError);
        }
      }

      // Get from database
      const version = await AppVersion.findOne({
        platform,
        isActive: true,
      }).sort({ publishedAt: -1 });

      if (!version) {
        throw new Error(`No active version found for platform: ${platform}`);
      }

      const versionInfo: VersionInfo = {
        latestVersion: version.latestVersion,
        minVersion: version.minVersion,
        downloadUrl: version.downloadUrl,
        releaseNotes: version.releaseNotes,
        releaseDate: version.releaseDate,
        updateRequired: version.updateRequired,
      };

      // Cache the version info (bypass cache if mandatory update)
      if (this.redisClient && !version.updateRequired) {
        try {
          await this.redisClient.setEx(
            cacheKey,
            CACHE_TTL,
            JSON.stringify(versionInfo)
          );
          console.log(`💾 Version info cached for ${platform}`);
        } catch (cacheError) {
          console.error("Cache write error:", cacheError);
        }
      }

      return versionInfo;
    } catch (error) {
      console.error("Get version info error:", error);
      throw error;
    }
  }

  /**
   * Update version configuration
   */
  async updateVersionConfig(
    config: VersionConfig,
    adminId: string
  ): Promise<void> {
    try {
      // Validate version format
      if (!this.isValidSemanticVersion(config.latestVersion)) {
        throw new Error(
          "Invalid latest version format. Use semantic versioning (e.g., 1.2.3)"
        );
      }

      if (!this.isValidSemanticVersion(config.minVersion)) {
        throw new Error(
          "Invalid minimum version format. Use semantic versioning (e.g., 1.2.3)"
        );
      }

      // Validate that minVersion <= latestVersion
      if (this.compareVersions(config.minVersion, config.latestVersion) > 0) {
        throw new Error(
          "Minimum version cannot be greater than latest version"
        );
      }

      // Validate release notes
      if (!config.releaseNotes || config.releaseNotes.length === 0) {
        throw new Error("Release notes are required");
      }

      if (config.releaseNotes.length > 10) {
        throw new Error("Maximum 10 release notes allowed");
      }

      // Deactivate previous versions for this platform
      await AppVersion.updateMany(
        { platform: config.platform, isActive: true },
        { isActive: false }
      );

      // Create new version
      const newVersion = new AppVersion({
        platform: config.platform,
        latestVersion: config.latestVersion,
        minVersion: config.minVersion,
        downloadUrl: config.downloadUrl,
        releaseNotes: config.releaseNotes,
        releaseDate: new Date(),
        updateRequired: config.updateRequired,
        publishedBy: new mongoose.Types.ObjectId(adminId),
        publishedAt: new Date(),
        isActive: true,
      });

      await newVersion.save();

      // Invalidate cache
      await this.invalidateCache(config.platform);

      console.log(
        `✅ Version config updated for ${config.platform}: ${config.latestVersion}`
      );
    } catch (error) {
      console.error("Update version config error:", error);
      throw error;
    }
  }

  /**
   * Check if update is required for a version
   */
  async checkVersion(
    currentVersion: string,
    platform: "ios" | "android"
  ): Promise<UpdateRequired> {
    try {
      const versionInfo = await this.getVersionInfo(platform);

      const isLatest =
        this.compareVersions(currentVersion, versionInfo.latestVersion) >= 0;
      const isBelowMin =
        this.compareVersions(currentVersion, versionInfo.minVersion) < 0;

      return {
        updateAvailable: !isLatest,
        updateRequired: isBelowMin,
        versionInfo: !isLatest ? versionInfo : undefined,
      };
    } catch (error) {
      console.error("Check version error:", error);
      throw error;
    }
  }

  /**
   * Log version check
   */
  async logVersionCheck(
    userId: string | undefined,
    version: string,
    platform: "ios" | "android"
  ): Promise<void> {
    try {
      const checkResult = await this.checkVersion(version, platform);

      await VersionCheckLog.create({
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        currentVersion: version,
        platform,
        updateAvailable: checkResult.updateAvailable,
        updateRequired: checkResult.updateRequired,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Log version check error:", error);
      // Don't throw - logging should not break version check
    }
  }

  /**
   * Get version analytics
   */
  async getVersionAnalytics(
    filters: AnalyticsFilters
  ): Promise<VersionAnalytics> {
    try {
      const query: any = {};

      if (filters.platform) {
        query.platform = filters.platform;
      }

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.timestamp.$lte = filters.endDate;
        }
      }

      // Get version distribution
      const distribution = await VersionCheckLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$currentVersion",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const totalUsers = distribution.reduce(
        (sum, item) => sum + item.count,
        0
      );

      // Get latest version for platform
      const latestVersionDoc = await AppVersion.findOne({
        platform: filters.platform || "android",
        isActive: true,
      });

      const latestVersion = latestVersionDoc?.latestVersion || "0.0.0";

      // Calculate users on latest version
      const usersOnLatest =
        distribution.find((item) => item._id === latestVersion)?.count || 0;

      const adoptionRate =
        totalUsers > 0 ? (usersOnLatest / totalUsers) * 100 : 0;

      const versionDistribution = distribution.map((item) => ({
        version: item._id,
        count: item.count,
        percentage: (item.count / totalUsers) * 100,
      }));

      return {
        versionDistribution,
        adoptionRate,
        totalUsers,
        usersOnLatest,
      };
    } catch (error) {
      console.error("Get version analytics error:", error);
      throw error;
    }
  }

  /**
   * Get all versions
   */
  async getAllVersions(platform?: "ios" | "android"): Promise<IAppVersion[]> {
    try {
      const query: any = {};
      if (platform) {
        query.platform = platform;
      }

      const versions = await AppVersion.find(query)
        .sort({ publishedAt: -1 })
        .populate("publishedBy", "profile.firstName profile.lastName email")
        .lean();

      return versions as IAppVersion[];
    } catch (error) {
      console.error("Get all versions error:", error);
      throw error;
    }
  }

  /**
   * Compare semantic versions
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  /**
   * Validate semantic version format
   */
  private isValidSemanticVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Invalidate version cache
   */
  private async invalidateCache(platform: string): Promise<void> {
    if (this.redisClient) {
      try {
        const cacheKey = `${CACHE_KEY_PREFIX}${platform}:v1`;
        await this.redisClient.del(cacheKey);
        console.log(`🗑️  Version cache invalidated for ${platform}`);
      } catch (error) {
        console.error("Cache invalidation error:", error);
      }
    }
  }
}

export const appVersionService = new AppVersionService();
