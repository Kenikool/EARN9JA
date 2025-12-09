import crypto from "crypto";
import TrustedDevice from "../models/TrustedDevice.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getDeviceInfo, getIPLocation } from "./sessionManager.js";

/**
 * Generate a unique device fingerprint based on multiple factors
 * @param {Object} req - Express request object
 * @returns {string} Device fingerprint hash
 */
export const generateDeviceFingerprint = (req) => {
  const userAgent = req.get("user-agent") || "";
  const acceptLanguage = req.get("accept-language") || "";
  const acceptEncoding = req.get("accept-encoding") || "";
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  // Create device fingerprint from multiple factors
  const deviceString = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ipAddress}`;
  
  return crypto
    .createHash("sha256")
    .update(deviceString)
    .digest("hex");
};

/**
 * Check if device is trusted for a user
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object|null>} Trusted device or null
 */
export const checkTrustedDevice = async (userId, req) => {
  try {
    const deviceFingerprint = generateDeviceFingerprint(req);

    const trustedDevice = await TrustedDevice.findOne({
      user: userId,
      deviceFingerprint,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });

    return trustedDevice;
  } catch (error) {
    console.error("Check trusted device error:", error);
    return null;
  }
};

/**
 * Add device to trusted devices
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @param {Object} options - Trust options
 * @returns {Promise<Object>} Created trusted device
 */
export const trustDevice = async (userId, req, options = {}) => {
  try {
    const deviceFingerprint = generateDeviceFingerprint(req);
    const deviceInfo = getDeviceInfo(req.get("user-agent"));
    const ipAddress = req.ip || req.connection.remoteAddress;
    const location = await getIPLocation(ipAddress);

    const {
      name = `${deviceInfo.browser} on ${deviceInfo.os}`,
      expiresInDays = 30,
      trustLevel = "medium",
    } = options;

    // Check if device already exists
    const existingDevice = await TrustedDevice.findOne({
      user: userId,
      deviceFingerprint,
    });

    if (existingDevice) {
      // Update existing device
      existingDevice.isActive = true;
      existingDevice.lastSeen = new Date();
      existingDevice.trustLevel = trustLevel;
      existingDevice.expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      await existingDevice.save();
      return existingDevice;
    }

    // Create new trusted device
    const trustedDevice = await TrustedDevice.create({
      user: userId,
      deviceFingerprint,
      name,
      deviceInfo,
      ipAddress,
      location,
      trustLevel,
      lastSeen: new Date(),
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined,
      isActive: true,
    });

    return trustedDevice;
  } catch (error) {
    console.error("Trust device error:", error);
    throw error;
  }
};

/**
 * Remove device from trusted devices
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID or database ID
 * @returns {Promise<boolean>} Success status
 */
export const untrustDevice = async (userId, deviceId) => {
  try {
    const result = await TrustedDevice.updateOne(
      {
        $or: [
          { _id: deviceId, user: userId },
          { deviceId, user: userId },
        ],
      },
      { isActive: false }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Untrust device error:", error);
    return false;
  }
};

/**
 * Get all trusted devices for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of trusted devices
 */
export const getUserTrustedDevices = async (userId) => {
  try {
    const devices = await TrustedDevice.find({
      user: userId,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }).sort({ lastSeen: -1 });

    return devices;
  } catch (error) {
    console.error("Get user trusted devices error:", error);
    return [];
  }
};

/**
 * Update device last seen timestamp
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @returns {Promise<void>}
 */
export const updateDeviceLastSeen = async (userId, req) => {
  try {
    const deviceFingerprint = generateDeviceFingerprint(req);

    await TrustedDevice.updateOne(
      {
        user: userId,
        deviceFingerprint,
        isActive: true,
      },
      {
        lastSeen: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
      }
    );
  } catch (error) {
    console.error("Update device last seen error:", error);
  }
};

/**
 * Detect suspicious device activity
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Suspicion analysis
 */
export const detectSuspiciousDevice = async (userId, req) => {
  try {
    const deviceInfo = getDeviceInfo(req.get("user-agent"));
    const ipAddress = req.ip || req.connection.remoteAddress;
    const location = await getIPLocation(ipAddress);

    // Get user's recent devices
    const recentDevices = await TrustedDevice.find({
      user: userId,
      lastSeen: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    const suspicionFactors = [];
    let suspicionScore = 0;

    // Check for new location
    const knownLocations = recentDevices.map(d => d.location.country).filter(Boolean);
    if (knownLocations.length > 0 && !knownLocations.includes(location.country)) {
      suspicionFactors.push("new_location");
      suspicionScore += 30;
    }

    // Check for new device type
    const knownDeviceTypes = recentDevices.map(d => d.deviceInfo.device).filter(Boolean);
    if (knownDeviceTypes.length > 0 && !knownDeviceTypes.includes(deviceInfo.device)) {
      suspicionFactors.push("new_device_type");
      suspicionScore += 20;
    }

    // Check for new browser
    const knownBrowsers = recentDevices.map(d => d.deviceInfo.browser.split(' ')[0]).filter(Boolean);
    const currentBrowser = deviceInfo.browser.split(' ')[0];
    if (knownBrowsers.length > 0 && !knownBrowsers.includes(currentBrowser)) {
      suspicionFactors.push("new_browser");
      suspicionScore += 15;
    }

    return {
      isSuspicious: suspicionScore >= 30,
      suspicionScore,
      suspicionFactors,
      deviceInfo,
      location,
    };
  } catch (error) {
    console.error("Detect suspicious device error:", error);
    return {
      isSuspicious: false,
      suspicionScore: 0,
      suspicionFactors: [],
      deviceInfo: getDeviceInfo(req.get("user-agent")),
      location: await getIPLocation(req.ip || req.connection.remoteAddress),
    };
  }
};

/**
 * Send device trust notification
 * @param {Object} user - User object
 * @param {Object} deviceInfo - Device information
 * @param {string} action - Action type (trusted, untrusted, suspicious)
 * @returns {Promise<void>}
 */
export const sendDeviceTrustNotification = async (user, deviceInfo, action) => {
  try {
    let subject, html, text;

    switch (action) {
      case "trusted":
        subject = "New Trusted Device Added";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Device Trusted</h2>
            <p>Hi ${user.name},</p>
            <p>A new device has been added to your trusted devices:</p>
            <ul>
              <li><strong>Device:</strong> ${deviceInfo.browser} on ${deviceInfo.os}</li>
              <li><strong>Location:</strong> ${deviceInfo.location?.city}, ${deviceInfo.location?.country}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>If you didn't perform this action, please secure your account immediately.</p>
          </div>
        `;
        text = `Hi ${user.name}, A new device has been trusted on your account: ${deviceInfo.browser} on ${deviceInfo.os}`;
        break;

      case "untrusted":
        subject = "Trusted Device Removed";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Device Untrusted</h2>
            <p>Hi ${user.name},</p>
            <p>A device has been removed from your trusted devices:</p>
            <ul>
              <li><strong>Device:</strong> ${deviceInfo.browser} on ${deviceInfo.os}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
        `;
        text = `Hi ${user.name}, A device has been removed from your trusted devices: ${deviceInfo.browser} on ${deviceInfo.os}`;
        break;

      case "suspicious":
        subject = "Suspicious Login Detected";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Suspicious Activity Detected</h2>
            <p>Hi ${user.name},</p>
            <p>We detected a login from an unrecognized device or location:</p>
            <ul>
              <li><strong>Device:</strong> ${deviceInfo.browser} on ${deviceInfo.os}</li>
              <li><strong>Location:</strong> ${deviceInfo.location?.city}, ${deviceInfo.location?.country}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>If this was you, you can trust this device in your security settings. If not, please secure your account immediately.</p>
          </div>
        `;
        text = `Hi ${user.name}, Suspicious login detected from: ${deviceInfo.browser} on ${deviceInfo.os} in ${deviceInfo.location?.city}, ${deviceInfo.location?.country}`;
        break;

      default:
        return;
    }

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send device trust notification error:", error);
  }
};

/**
 * Clean up expired trusted devices
 * @returns {Promise<number>} Number of devices cleaned up
 */
export const cleanupExpiredTrustedDevices = async () => {
  try {
    const result = await TrustedDevice.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { lastSeen: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }, // 90 days inactive
      ],
    });

    return result.deletedCount;
  } catch (error) {
    console.error("Cleanup expired trusted devices error:", error);
    return 0;
  }
};

export default {
  generateDeviceFingerprint,
  checkTrustedDevice,
  trustDevice,
  untrustDevice,
  getUserTrustedDevices,
  updateDeviceLastSeen,
  detectSuspiciousDevice,
  sendDeviceTrustNotification,
  cleanupExpiredTrustedDevices,
};
