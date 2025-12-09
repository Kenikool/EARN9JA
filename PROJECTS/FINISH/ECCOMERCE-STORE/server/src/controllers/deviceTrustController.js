import {
  checkTrustedDevice,
  trustDevice,
  untrustDevice,
  getUserTrustedDevices,
  detectSuspiciousDevice,
  sendDeviceTrustNotification,
  generateDeviceFingerprint,
} from "../utils/deviceTrust.js";
import ActivityLog from "../models/ActivityLog.js";
import TrustedDevice from "../models/TrustedDevice.js";

// @desc    Get all trusted devices for current user
// @route   GET /api/auth/trusted-devices
// @access  Private
export const getTrustedDevices = async (req, res) => {
  try {
    const devices = await getUserTrustedDevices(req.user._id);
    
    // Mark current device
    const currentDeviceFingerprint = generateDeviceFingerprint(req);
    const devicesWithCurrent = devices.map((device) => ({
      _id: device._id,
      name: device.name,
      deviceInfo: device.deviceInfo,
      location: device.location,
      lastSeen: device.lastSeen,
      createdAt: device.createdAt,
      trustLevel: device.trustLevel,
      isCurrent: device.deviceFingerprint === currentDeviceFingerprint,
    }));

    res.status(200).json({
      status: "success",
      data: {
        devices: devicesWithCurrent,
        total: devicesWithCurrent.length,
      },
    });
  } catch (error) {
    console.error("Get trusted devices error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch trusted devices",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Trust current device
// @route   POST /api/auth/trusted-devices/trust
// @access  Private
export const trustCurrentDevice = async (req, res) => {
  try {
    const { name, expiresInDays = 30, trustLevel = "medium" } = req.body;

    // Check if device is already trusted
    const existingTrust = await checkTrustedDevice(req.user._id, req);
    if (existingTrust) {
      return res.status(400).json({
        status: "error",
        message: "Device is already trusted",
      });
    }

    // Trust the device
    const trustedDevice = await trustDevice(req.user._id, req, {
      name,
      expiresInDays,
      trustLevel,
    });

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: "trusted_device_added",
      details: {
        deviceFingerprint: trustedDevice.deviceFingerprint,
        name: trustedDevice.name,
        trustLevel,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send notification
    await sendDeviceTrustNotification(
      req.user,
      {
        ...trustedDevice.deviceInfo,
        location: trustedDevice.location,
      },
      "trusted"
    );

    res.status(201).json({
      status: "success",
      message: "Device trusted successfully",
      data: {
        device: {
          _id: trustedDevice._id,
          name: trustedDevice.name,
          deviceInfo: trustedDevice.deviceInfo,
          location: trustedDevice.location,
          trustLevel: trustedDevice.trustLevel,
          expiresAt: trustedDevice.expiresAt,
        },
      },
    });
  } catch (error) {
    console.error("Trust current device error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to trust device",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Untrust a device
// @route   DELETE /api/auth/trusted-devices/:id
// @access  Private
export const untrustDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get device info before removing
    const device = await TrustedDevice.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        status: "error",
        message: "Trusted device not found",
      });
    }

    // Remove trust
    const success = await untrustDevice(req.user._id, id);
    
    if (!success) {
      return res.status(400).json({
        status: "error",
        message: "Failed to untrust device",
      });
    }

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: "trusted_device_removed",
      details: {
        deviceFingerprint: device.deviceFingerprint,
        name: device.name,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send notification
    await sendDeviceTrustNotification(
      req.user,
      device.deviceInfo,
      "untrusted"
    );

    res.status(200).json({
      status: "success",
      message: "Device untrusted successfully",
    });
  } catch (error) {
    console.error("Untrust device error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to untrust device",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Check if current device is trusted
// @route   GET /api/auth/trusted-devices/check
// @access  Private
export const checkCurrentDeviceTrust = async (req, res) => {
  try {
    const trustedDevice = await checkTrustedDevice(req.user._id, req);
    const suspicionAnalysis = await detectSuspiciousDevice(req.user._id, req);

    res.status(200).json({
      status: "success",
      data: {
        isTrusted: !!trustedDevice,
        device: trustedDevice ? {
          _id: trustedDevice._id,
          name: trustedDevice.name,
          trustLevel: trustedDevice.trustLevel,
          lastSeen: trustedDevice.lastSeen,
        } : null,
        suspicion: {
          isSuspicious: suspicionAnalysis.isSuspicious,
          score: suspicionAnalysis.suspicionScore,
          factors: suspicionAnalysis.suspicionFactors,
        },
        deviceInfo: suspicionAnalysis.deviceInfo,
        location: suspicionAnalysis.location,
      },
    });
  } catch (error) {
    console.error("Check device trust error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check device trust",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  getTrustedDevices,
  trustCurrentDevice,
  untrustDeviceById,
  checkCurrentDeviceTrust,
};
