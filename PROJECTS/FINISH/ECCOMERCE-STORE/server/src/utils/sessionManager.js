import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import Session from "../models/Session.js";
import { getRedisClient } from "../config/redis.js";

/**
 * Extract device information from user agent
 * @param {string} userAgent - User agent string
 * @returns {Object} Device information
 */
export const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    userAgent,
    browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    device: result.device.type || "desktop",
  };
};

/**
 * Generate device fingerprint from request
 * @param {Object} req - Express request object
 * @returns {string} Device fingerprint hash
 */
export const generateDeviceFingerprint = (req) => {
  const userAgent = req.get("user-agent") || "";
  const acceptLanguage = req.get("accept-language") || "";
  const acceptEncoding = req.get("accept-encoding") || "";
  
  // Create fingerprint from multiple factors
  const fingerprintString = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  
  return crypto
    .createHash("sha256")
    .update(fingerprintString)
    .digest("hex");
};

/**
 * Get IP geolocation (mock implementation - integrate with real service in production)
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} Location information
 */
export const getIPLocation = async (ipAddress) => {
  // In production, integrate with services like:
  // - ipapi.co
  // - ip-api.com
  // - MaxMind GeoIP2
  
  // Mock implementation for development
  if (ipAddress === "::1" || ipAddress === "127.0.0.1" || ipAddress.startsWith("::ffff:127.")) {
    return {
      country: "Local",
      city: "Localhost",
      region: "Development",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      coordinates: [0, 0],
    };
  }

  // For production, uncomment and use a real service:
  /*
  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();
    
    return {
      country: data.country_name,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
      coordinates: [data.latitude, data.longitude],
    };
  } catch (error) {
    console.error("IP geolocation error:", error);
    return {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
      timezone: "UTC",
      coordinates: [0, 0],
    };
  }
  */

  return {
    country: "Unknown",
    city: "Unknown",
    region: "Unknown",
    timezone: "UTC",
    coordinates: [0, 0],
  };
};

/**
 * Create a new session
 * @param {Object} user - User object
 * @param {Object} req - Express request object
 * @param {string} token - JWT token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Created session
 */
export const createSession = async (user, req, token, refreshToken) => {
  try {
    const deviceInfo = getDeviceInfo(req.get("user-agent"));
    const deviceFingerprint = generateDeviceFingerprint(req);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const location = await getIPLocation(ipAddress);

    // Hash tokens for storage
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Calculate expiry (30 minutes for regular, 30 days for remember me)
    const rememberMe = req.body.rememberMe || false;
    const expiresAt = new Date(
      Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000)
    );

    // Create session in database
    const session = await Session.create({
      user: user._id,
      token: hashedToken,
      refreshToken: hashedRefreshToken,
      deviceInfo,
      ipAddress,
      location,
      isTrusted: false,
      lastActivity: new Date(),
      expiresAt,
      isActive: true,
    });

    // Store session in Redis for fast lookup (if available)
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        const sessionData = JSON.stringify({
          userId: user._id.toString(),
          sessionId: session._id.toString(),
          expiresAt: expiresAt.toISOString(),
        });
        
        const ttl = Math.floor((expiresAt - new Date()) / 1000);
        await redisClient.setEx(`session:${hashedToken}`, ttl, sessionData);
      } catch (error) {
        console.error("Redis session storage error:", error);
        // Continue without Redis
      }
    }

    return session;
  } catch (error) {
    console.error("Create session error:", error);
    throw error;
  }
};

/**
 * Get session by token
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} Session object or null
 */
export const getSessionByToken = async (token) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Try Redis first for performance
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        const cachedSession = await redisClient.get(`session:${hashedToken}`);
        if (cachedSession) {
          const sessionData = JSON.parse(cachedSession);
          // Verify not expired
          if (new Date(sessionData.expiresAt) > new Date()) {
            return await Session.findById(sessionData.sessionId);
          }
        }
      } catch (error) {
        console.error("Redis session lookup error:", error);
        // Fall through to database lookup
      }
    }

    // Database lookup
    const session = await Session.findOne({
      token: hashedToken,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};

/**
 * Update session last activity
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
export const updateSessionActivity = async (sessionId) => {
  try {
    await Session.findByIdAndUpdate(sessionId, {
      lastActivity: new Date(),
    });
  } catch (error) {
    console.error("Update session activity error:", error);
  }
};

/**
 * Invalidate session
 * @param {string} sessionId - Session ID
 * @param {string} token - JWT token (optional, for Redis cleanup)
 * @returns {Promise<void>}
 */
export const invalidateSession = async (sessionId, token = null) => {
  try {
    // Mark session as inactive in database
    await Session.findByIdAndUpdate(sessionId, {
      isActive: false,
    });

    // Remove from Redis if token provided
    if (token) {
      const redisClient = getRedisClient();
      if (redisClient) {
        try {
          const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
          await redisClient.del(`session:${hashedToken}`);
        } catch (error) {
          console.error("Redis session deletion error:", error);
        }
      }
    }
  } catch (error) {
    console.error("Invalidate session error:", error);
    throw error;
  }
};

/**
 * Invalidate all user sessions except current
 * @param {string} userId - User ID
 * @param {string} currentSessionId - Current session ID to keep active
 * @returns {Promise<number>} Number of sessions invalidated
 */
export const invalidateAllUserSessions = async (userId, currentSessionId = null) => {
  try {
    const query = {
      user: userId,
      isActive: true,
    };

    if (currentSessionId) {
      query._id = { $ne: currentSessionId };
    }

    const result = await Session.updateMany(query, {
      isActive: false,
    });

    // Clear Redis cache for user sessions
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        const sessions = await Session.find(query).select("token");
        for (const session of sessions) {
          await redisClient.del(`session:${session.token}`);
        }
      } catch (error) {
        console.error("Redis bulk session deletion error:", error);
      }
    }

    return result.modifiedCount;
  } catch (error) {
    console.error("Invalidate all sessions error:", error);
    throw error;
  }
};

/**
 * Clean up expired sessions
 * @returns {Promise<number>} Number of sessions cleaned up
 */
export const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { lastActivity: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // 30 days inactive
      ],
    });

    return result.deletedCount;
  } catch (error) {
    console.error("Cleanup expired sessions error:", error);
    return 0;
  }
};

export default {
  getDeviceInfo,
  generateDeviceFingerprint,
  getIPLocation,
  createSession,
  getSessionByToken,
  updateSessionActivity,
  invalidateSession,
  invalidateAllUserSessions,
  cleanupExpiredSessions,
};
