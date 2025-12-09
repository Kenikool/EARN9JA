import rateLimit from "express-rate-limit";
import { getRedisClient } from "../config/redis.js";
import IPWhitelist from "../models/IPWhitelist.js";
import RateLimitViolation from "../models/RateLimitViolation.js";

// Import the ipKeyGenerator helper for IPv6 support
const { ipKeyGenerator } = rateLimit;

// Disable rate limiting for development to avoid IPv6 issues
const DISABLE_RATE_LIMIT = process.env.NODE_ENV === "development";

/**
 * Log rate limit violation
 * @param {Object} req - Express request object
 * @param {number} requestCount - Number of requests made
 * @param {number} limit - Rate limit threshold
 * @param {number} windowMs - Time window in milliseconds
 */
const logRateLimitViolation = async (req, requestCount, limit, windowMs) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;

    // Check if IP is whitelisted
    const whitelisted = await IPWhitelist.findOne({
      ipAddress: ip,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });

    // Extract user ID if authenticated
    const userId = req.user?._id;

    // Create violation record
    await RateLimitViolation.create({
      ipAddress: ip,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      userAgent: req.get("user-agent"),
      user: userId,
      requestCount,
      limit,
      windowMs,
      isWhitelisted: !!whitelisted,
      blocked: !whitelisted,
    });
  } catch (error) {
    console.error("Error logging rate limit violation:", error);
  }
};

/**
 * Create a rate limiter with Redis store
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // Max requests per window
    message = "Too many requests, please try again later",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const redisClient = getRedisClient();

  // If Redis is not available, use memory store (less efficient but works)
  const limiterConfig = {
    windowMs,
    max,
    message: {
      status: "error",
      message,
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    // Use the built-in IP key generator for proper IPv6 support
    keyGenerator: ipKeyGenerator,
    // Skip rate limiting for whitelisted IPs
    skip: async (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      try {
        const whitelisted = await IPWhitelist.findOne({
          ipAddress: ip,
          isActive: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        });
        return !!whitelisted;
      } catch (error) {
        console.error("Error checking IP whitelist:", error);
        return false;
      }
    },
    // Handler for when rate limit is exceeded
    handler: async (req, res) => {
      const ip = req.ip || req.connection.remoteAddress;
      const redisKey = `rate-limit:${ip}`;

      let requestCount = max + 1; // Default to just over limit

      // Try to get actual request count from Redis
      if (redisClient) {
        try {
          const count = await redisClient.get(redisKey);
          if (count) {
            requestCount = parseInt(count);
          }
        } catch (error) {
          console.error("Error getting rate limit count:", error);
        }
      }

      // Log the violation
      await logRateLimitViolation(req, requestCount, max, windowMs);

      // Send response
      res.status(429).json({
        status: "error",
        message,
        data: {
          retryAfter: Math.ceil(windowMs / 1000),
        },
      });
    },
  };

  // Add Redis store if available
  if (redisClient) {
    // Manual Redis store implementation
    limiterConfig.store = {
      async increment(key) {
        const redisKey = `rate-limit:${key}`;
        const current = await redisClient.incr(redisKey);

        if (current === 1) {
          await redisClient.expire(redisKey, Math.ceil(windowMs / 1000));
        }

        const ttl = await redisClient.ttl(redisKey);
        const resetTime = new Date(Date.now() + ttl * 1000);

        return {
          totalHits: current,
          resetTime,
        };
      },

      async decrement(key) {
        const redisKey = `rate-limit:${key}`;
        await redisClient.decr(redisKey);
      },

      async resetKey(key) {
        const redisKey = `rate-limit:${key}`;
        await redisClient.del(redisKey);
      },
    };
  }

  // Return a no-op middleware if rate limiting is disabled
  if (DISABLE_RATE_LIMIT) {
    return (req, res, next) => next();
  }

  return rateLimit(limiterConfig);
};

// Pre-configured rate limiters for different endpoints

/**
 * Login rate limiter - 10 attempts per minute
 */
export const loginLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: "Too many login attempts. Please try again in a minute.",
  skipSuccessfulRequests: false,
});

/**
 * Registration rate limiter - 5 attempts per hour
 */
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many registration attempts. Please try again later.",
});

/**
 * Password reset rate limiter - 3 attempts per hour
 */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset requests. Please try again later.",
});

/**
 * 2FA verification rate limiter - 3 attempts per 15 minutes
 */
export const twoFactorLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: "Too many 2FA attempts. Please try again in 15 minutes.",
  skipSuccessfulRequests: true,
});

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests. Please try again later.",
});

/**
 * Strict rate limiter for sensitive operations - 5 per hour
 */
export const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Rate limit exceeded. Please try again later.",
});

export default createRateLimiter;
