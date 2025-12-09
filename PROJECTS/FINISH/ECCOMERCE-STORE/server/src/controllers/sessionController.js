import Session from "../models/Session.js";
import ActivityLog from "../models/ActivityLog.js";
import {
  invalidateSession,
  invalidateAllUserSessions,
  generateDeviceFingerprint,
} from "../utils/sessionManager.js";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Get all active sessions for current user
// @route   GET /api/auth/sessions
// @access  Private
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActivity: -1 });

    // Get current session token from request
    const currentToken = req.headers.authorization?.split(" ")[1];
    const currentFingerprint = generateDeviceFingerprint(req);

    // Mark current session
    const sessionsWithCurrent = sessions.map((session) => ({
      _id: session._id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      isTrusted: session.isTrusted,
      isCurrent: session.deviceInfo.userAgent === req.get("user-agent"),
    }));

    res.status(200).json({
      status: "success",
      data: {
        sessions: sessionsWithCurrent,
        total: sessionsWithCurrent.length,
      },
    });
  } catch (error) {
    console.error("Get user sessions error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sessions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Revoke a specific session
// @route   DELETE /api/auth/sessions/:id
// @access  Private
export const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Find session and verify ownership
    const session = await Session.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found",
      });
    }

    // Invalidate session
    await invalidateSession(id);

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: "session_revoked",
      details: {
        sessionId: id,
        device: session.deviceInfo.device,
        browser: session.deviceInfo.browser,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send notification email
    await sendEmail({
      to: req.user.email,
      subject: "Session Revoked - Security Alert",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Session Revoked</h2>
          <p>Hi ${req.user.name},</p>
          <p>A session on your account has been revoked:</p>
          <ul>
            <li><strong>Device:</strong> ${session.deviceInfo.browser} on ${session.deviceInfo.os}</li>
            <li><strong>Location:</strong> ${session.location.city}, ${session.location.country}</li>
            <li><strong>Last Activity:</strong> ${session.lastActivity.toLocaleString()}</li>
          </ul>
          <p>If you didn't perform this action, please secure your account immediately.</p>
        </div>
      `,
      text: `Hi ${req.user.name}, A session on your account has been revoked. Device: ${session.deviceInfo.browser} on ${session.deviceInfo.os}`,
    });

    res.status(200).json({
      status: "success",
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to revoke session",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Logout from all devices except current
// @route   DELETE /api/auth/sessions/all
// @access  Private
export const logoutAllDevices = async (req, res) => {
  try {
    // Get current session
    const currentToken = req.headers.authorization?.split(" ")[1];
    let currentSessionId = null;

    if (currentToken) {
      const crypto = await import("crypto");
      const hashedToken = crypto.default.createHash("sha256").update(currentToken).digest("hex");
      const currentSession = await Session.findOne({
        token: hashedToken,
        user: req.user._id,
      });
      currentSessionId = currentSession?._id;
    }

    // Invalidate all sessions except current
    const count = await invalidateAllUserSessions(req.user._id, currentSessionId);

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: "logout",
      details: {
        type: "all_devices",
        sessionsRevoked: count,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send security alert
    await sendEmail({
      to: req.user.email,
      subject: "All Sessions Terminated - Security Alert",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>All Sessions Terminated</h2>
          <p>Hi ${req.user.name},</p>
          <p>All sessions on your account have been terminated except your current session.</p>
          <p><strong>Sessions Revoked:</strong> ${count}</p>
          <p>If you didn't perform this action, please secure your account immediately and change your password.</p>
        </div>
      `,
      text: `Hi ${req.user.name}, All sessions on your account have been terminated. Sessions revoked: ${count}`,
    });

    res.status(200).json({
      status: "success",
      message: `Successfully logged out from ${count} device(s)`,
      data: {
        sessionsRevoked: count,
      },
    });
  } catch (error) {
    console.error("Logout all devices error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to logout from all devices",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Extend current session
// @route   POST /api/auth/sessions/extend
// @access  Private
export const extendSession = async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(" ")[1];
    
    if (!currentToken) {
      return res.status(400).json({
        status: "error",
        message: "No active session found",
      });
    }

    const crypto = await import("crypto");
    const hashedToken = crypto.default.createHash("sha256").update(currentToken).digest("hex");
    
    const session = await Session.findOne({
      token: hashedToken,
      user: req.user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found",
      });
    }

    // Extend session by 30 minutes
    session.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    session.lastActivity = new Date();
    await session.save();

    res.status(200).json({
      status: "success",
      message: "Session extended successfully",
      data: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Extend session error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to extend session",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  getUserSessions,
  revokeSession,
  logoutAllDevices,
  extendSession,
};
