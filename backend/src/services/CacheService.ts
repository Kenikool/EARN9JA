import { redisClient, isRedisAvailable } from "../config/redis.js";

export class CacheService {
  private readonly DEFAULT_TTL = 3600;
  private inMemoryCache: Map<string, { value: any; expiry: number }> =
    new Map();

  async get<T>(key: string): Promise<T | null> {
    try {
      // Use Redis if available
      if (isRedisAvailable() && redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      }

      // Fallback to in-memory cache
      const cached = this.inMemoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }
      this.inMemoryCache.delete(key);
      return null;
    } catch (error) {
      // Silently fallback to in-memory
      const cached = this.inMemoryCache.get(key);
      return cached && cached.expiry > Date.now() ? cached.value : null;
    }
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      // Use Redis if available
      if (isRedisAvailable() && redisClient) {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        return;
      }

      // Fallback to in-memory cache
      this.inMemoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    } catch (error) {
      // Silently fallback to in-memory
      this.inMemoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (isRedisAvailable()) {
        await redisClient.del(key);
      } else {
        this.inMemoryCache.delete(key);
      }
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      if (isRedisAvailable()) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        // Simple pattern matching for in-memory cache
        const regex = new RegExp(pattern.replace("*", ".*"));
        for (const key of this.inMemoryCache.keys()) {
          if (regex.test(key)) {
            this.inMemoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (isRedisAvailable()) {
        const result = await redisClient.exists(key);
        return result === 1;
      }

      const cached = this.inMemoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return true;
      }
      this.inMemoryCache.delete(key);
      return false;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      if (isRedisAvailable()) {
        return await redisClient.ttl(key);
      }

      const cached = this.inMemoryCache.get(key);
      if (cached) {
        return Math.floor((cached.expiry - Date.now()) / 1000);
      }
      return -1;
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async flush(): Promise<void> {
    try {
      if (isRedisAvailable()) {
        await redisClient.flushAll();
      } else {
        this.inMemoryCache.clear();
      }
    } catch (error) {
      console.error("Cache flush error:", error);
    }
  }
}

export const cacheService = new CacheService();
