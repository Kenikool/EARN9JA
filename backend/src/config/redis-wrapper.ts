/**
 * Redis Wrapper with In-Memory Fallback
 * Provides Redis-like interface that falls back to in-memory cache when Redis is unavailable
 */

import { redisClient, isRedisAvailable } from "./redis.js";

// In-memory cache fallback
const memoryCache = new Map<string, { value: string; expiry?: number }>();

// Cleanup expired items periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memoryCache.entries()) {
    if (data.expiry && data.expiry < now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Every minute

export const redis = {
  async get(key: string): Promise<string | null> {
    if (isRedisAvailable() && redisClient) {
      try {
        return await redisClient.get(key);
      } catch (error) {
        console.warn("Redis get failed, using memory cache");
      }
    }

    const data = memoryCache.get(key);
    if (!data) return null;

    if (data.expiry && data.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }

    return data.value;
  },

  async set(key: string, value: string): Promise<void> {
    if (isRedisAvailable() && redisClient) {
      try {
        await redisClient.set(key, value);
        return;
      } catch (error) {
        console.warn("Redis set failed, using memory cache");
      }
    }

    memoryCache.set(key, { value });
  },

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (isRedisAvailable() && redisClient) {
      try {
        await redisClient.setEx(key, seconds, value);
        return;
      } catch (error) {
        console.warn("Redis setex failed, using memory cache");
      }
    }

    const expiry = Date.now() + seconds * 1000;
    memoryCache.set(key, { value, expiry });
  },

  async del(key: string): Promise<void> {
    if (isRedisAvailable() && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch (error) {
        console.warn("Redis del failed, using memory cache");
      }
    }

    memoryCache.delete(key);
  },

  async incr(key: string): Promise<number> {
    if (isRedisAvailable() && redisClient) {
      try {
        return await redisClient.incr(key);
      } catch (error) {
        console.warn("Redis incr failed, using memory cache");
      }
    }

    const data = memoryCache.get(key);
    const currentValue = data ? parseInt(data.value, 10) || 0 : 0;
    const newValue = currentValue + 1;
    memoryCache.set(key, { value: newValue.toString(), expiry: data?.expiry });
    return newValue;
  },

  async expire(key: string, seconds: number): Promise<void> {
    if (isRedisAvailable() && redisClient) {
      try {
        await redisClient.expire(key, seconds);
        return;
      } catch (error) {
        console.warn("Redis expire failed, using memory cache");
      }
    }

    const data = memoryCache.get(key);
    if (data) {
      data.expiry = Date.now() + seconds * 1000;
    }
  },

  async keys(pattern: string): Promise<string[]> {
    if (isRedisAvailable() && redisClient) {
      try {
        return await redisClient.keys(pattern);
      } catch (error) {
        console.warn("Redis keys failed, using memory cache");
      }
    }

    // Simple pattern matching for memory cache
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return Array.from(memoryCache.keys()).filter((key) => regex.test(key));
  },
};
