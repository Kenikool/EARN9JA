import User from "../models/User.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import ActivityLog from "../models/ActivityLog.js";
import LoginAttempt from "../models/LoginAttempt.js";
import Session from "../models/Session.js";
import TrustedDevice from "../models/TrustedDevice.js";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Collect all user data for GDPR export
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Complete user data
 */
export const collectUserData = async (userId) => {
  try {
    // Get user profile
    const user = await User.findById(userId).select("-password -twoFactorSecret -twoFactorBackupCodes");
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get orders
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name")
      .lean();

    // Get reviews
    const reviews = await Review.find({ user: userId })
      .populate("product", "name")
      .lean();

    // Get activity logs
    const activityLogs = await ActivityLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(1000) // Last 1000 activities
      .lean();

    // Get login attempts
    const loginAttempts = await LoginAttempt.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(500) // Last 500 login attempts
      .lean();

    // Get sessions
    const sessions = await Session.find({ user: userId })
      .lean();

    // Get trusted devices
    const trustedDevices = await TrustedDevice.find({ user: userId })
      .lean();

    // Compile all data
    const userData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      user: {
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          phoneNumber: user.phoneNumber,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        addresses: user.addresses,
        wishlist: user.wishlist,
        security: {
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorMethod: user.twoFactorMethod,
          accountStatus: user.accountStatus,
          passwordChangedAt: user.passwordChangedAt,
          passwordExpiresAt: user.passwordExpiresAt,
        },
        privacy: user.privacySettings,
      },
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
      })),
      reviews: reviews.map(review => ({
        id: review._id,
        product: review.product,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      activityLogs: activityLogs.map(log => ({
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
      })),
      loginAttempts: loginAttempts.map(attempt => ({
        success: attempt.success,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        location: attempt.location,
        timestamp: attempt.timestamp,
        failureReason: attempt.failureReason,
      })),
      sessions: sessions.map(session => ({
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        location: session.location,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      })),
      trustedDevices: trustedDevices.map(device => ({
        name: device.name,
        deviceInfo: device.deviceInfo,
        location: device.location,
        trustLevel: device.trustLevel,
        createdAt: device.createdAt,
        lastSeen: device.lastSeen,
      })),
    };

    return userData;
  } catch (error) {
    console.error("Collect user data error:", error);
    throw error;
  }
};

/**
 * Generate export file and save to disk
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Export file info
 */
export const generateExportFile = async (userId) => {
  try {
    // Collect data
    const userData = await collectUserData(userId);

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");
    const filename = `user-data-${userId}-${Date.now()}.json`;
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), "exports");
    try {
      await fs.access(exportsDir);
    } catch {
      await fs.mkdir(exportsDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(exportsDir, filename);
    await fs.writeFile(filepath, JSON.stringify(userData, null, 2), "utf-8");

    // Set expiry date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      token,
      filename,
      filepath,
      expiresAt,
      size: (await fs.stat(filepath)).size,
    };
  } catch (error) {
    console.error("Generate export file error:", error);
    throw error;
  }
};

/**
 * Get export file by token
 * @param {string} token - Export token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Export file info
 */
export const getExportFile = async (token, userId) => {
  try {
    const exportsDir = path.join(process.cwd(), "exports");
    const files = await fs.readdir(exportsDir);
    
    // Find file matching user ID
    const userFiles = files.filter(f => f.includes(userId));
    
    if (userFiles.length === 0) {
      return null;
    }

    // Get the most recent file
    const filename = userFiles[userFiles.length - 1];
    const filepath = path.join(exportsDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
      const stats = await fs.stat(filepath);
      
      return {
        filename,
        filepath,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Get export file error:", error);
    return null;
  }
};

/**
 * Delete export file
 * @param {string} filepath - File path
 * @returns {Promise<boolean>} Success status
 */
export const deleteExportFile = async (filepath) => {
  try {
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error("Delete export file error:", error);
    return false;
  }
};

/**
 * Clean up expired export files
 * @returns {Promise<number>} Number of files deleted
 */
export const cleanupExpiredExports = async () => {
  try {
    const exportsDir = path.join(process.cwd(), "exports");
    
    try {
      await fs.access(exportsDir);
    } catch {
      return 0;
    }

    const files = await fs.readdir(exportsDir);
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;

    for (const file of files) {
      const filepath = path.join(exportsDir, file);
      const stats = await fs.stat(filepath);
      
      // Delete files older than 7 days
      if (stats.birthtimeMs < sevenDaysAgo) {
        await fs.unlink(filepath);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error("Cleanup expired exports error:", error);
    return 0;
  }
};

export default {
  collectUserData,
  generateExportFile,
  getExportFile,
  deleteExportFile,
  cleanupExpiredExports,
};
