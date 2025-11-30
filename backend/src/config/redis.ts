import { createClient } from "redis";

let redisClient: any = null;
let isRedisConnected = false;

export const connectRedis = async (): Promise<void> => {
  // Skip Redis in development if not available
  if (process.env.NODE_ENV === "development" && !process.env.REDIS_HOST) {
    console.log(
      "⚠️  Redis disabled in development mode - using in-memory cache"
    );
    isRedisConnected = false;
    return;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        reconnectStrategy: false, // Disable auto-reconnect
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on("error", () => {
      // Silently fail - we'll use in-memory cache
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.log("⚠️  Redis not available - using in-memory cache");
    isRedisConnected = false;
    redisClient = null;
  }
};

export const isRedisAvailable = (): boolean => isRedisConnected;

export { redisClient };
