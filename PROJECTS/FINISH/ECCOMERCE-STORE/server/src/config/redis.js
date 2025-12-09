import { createClient } from "redis";

let redisClient = null;

/**
 * Initialize Redis client
 * @returns {Promise<Object>} Redis client instance
 */
export const initRedis = async () => {
  // Skip Redis initialization if URL is commented out
  if (!process.env.REDIS_URL || process.env.REDIS_URL.startsWith('#')) {
    console.log("ℹ️ Redis: Skipped (URL commented out)");
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("❌ Redis: Too many reconnection attempts");
            return new Error("Too many retries");
          }
          return retries * 100; // Exponential backoff
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("🔄 Redis: Connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis: Connected and ready");
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Redis: Reconnecting...");
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error("❌ Redis initialization error:", error);
    // Don't throw error - allow app to run without Redis
    return null;
  }
};

/**
 * Get Redis client instance
 * @returns {Object|null} Redis client or null if not initialized
 */
export const getRedisClient = () => {
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("👋 Redis: Connection closed");
  }
};

export default {
  initRedis,
  getRedisClient,
  closeRedis,
};
