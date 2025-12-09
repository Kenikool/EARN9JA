import { getSessionByToken, updateSessionActivity } from "../utils/sessionManager.js";

/**
 * Middleware to validate session and track activity
 * Should be used after authenticate middleware
 */
export const validateSession = async (req, res, next) => {
  try {
    // Skip if no user (not authenticated)
    if (!req.user) {
      return next();
    }

    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return next();
    }

    // Get session from database/Redis
    const session = await getSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        status: "error",
        message: "Session expired or invalid. Please login again.",
        code: "SESSION_EXPIRED",
      });
    }

    // Check if session is active
    if (!session.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Session has been revoked. Please login again.",
        code: "SESSION_REVOKED",
      });
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
      return res.status(401).json({
        status: "error",
        message: "Session expired. Please login again.",
        code: "SESSION_EXPIRED",
      });
    }

    // Check for inactivity (30 minutes)
    const inactivityLimit = 30 * 60 * 1000; // 30 minutes
    const timeSinceLastActivity = Date.now() - new Date(session.lastActivity).getTime();
    
    if (timeSinceLastActivity > inactivityLimit) {
      // Mark session as inactive
      session.isActive = false;
      await session.save();

      return res.status(401).json({
        status: "error",
        message: "Session expired due to inactivity. Please login again.",
        code: "SESSION_TIMEOUT",
      });
    }

    // Update last activity timestamp
    await updateSessionActivity(session._id);

    // Attach session to request
    req.session = session;

    next();
  } catch (error) {
    console.error("Session validation error:", error);
    // Don't block request on session validation errors
    next();
  }
};

export default validateSession;
