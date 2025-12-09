import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "./sendEmail.js";
import { emailTemplates } from "./emailTemplates.js";

/**
 * Check if password was used recently
 * @param {Object} user - User object
 * @param {string} newPassword - New password to check
 * @returns {Promise<boolean>} True if password was used before
 */
export const isPasswordInHistory = async (user, newPassword) => {
  try {
    if (!user.passwordHistory || user.passwordHistory.length === 0) {
      return false;
    }

    // Check against password history (last 5 passwords)
    for (const historyEntry of user.passwordHistory) {
      const isMatch = await bcrypt.compare(newPassword, historyEntry.password);
      if (isMatch) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Check password history error:", error);
    return false;
  }
};

/**
 * Add current password to history
 * @param {Object} user - User object
 * @param {string} hashedPassword - Hashed password to add
 * @returns {Promise<void>}
 */
export const addPasswordToHistory = async (user, hashedPassword) => {
  try {
    // Initialize password history if it doesn't exist
    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }

    // Add current password to history
    user.passwordHistory.push({
      password: hashedPassword,
      changedAt: new Date(),
    });

    // Keep only last 5 passwords
    if (user.passwordHistory.length > 5) {
      user.passwordHistory = user.passwordHistory.slice(-5);
    }

    await user.save();
  } catch (error) {
    console.error("Add password to history error:", error);
    throw error;
  }
};

/**
 * Check if password has expired
 * @param {Object} user - User object
 * @returns {boolean} True if password has expired
 */
export const isPasswordExpired = (user) => {
  if (!user.passwordExpiresAt) {
    return false;
  }

  return new Date() > new Date(user.passwordExpiresAt);
};

/**
 * Set password expiry date
 * @param {Object} user - User object
 * @param {number} days - Number of days until expiry (default 90)
 * @returns {Date} Expiry date
 */
export const setPasswordExpiry = (user, days = 90) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  user.passwordExpiresAt = expiryDate;
  user.passwordChangedAt = new Date();
  return expiryDate;
};

/**
 * Get days until password expires
 * @param {Object} user - User object
 * @returns {number} Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (user) => {
  if (!user.passwordExpiresAt) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(user.passwordExpiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Check if password is about to expire (within 7 days)
 * @param {Object} user - User object
 * @returns {boolean} True if password expires soon
 */
export const isPasswordExpiringSoon = (user) => {
  const daysUntilExpiry = getDaysUntilExpiry(user);
  return daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7;
};

/**
 * Send password expiry reminder email
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
export const sendPasswordExpiryReminder = async (user) => {
  try {
    const daysUntilExpiry = getDaysUntilExpiry(user);

    if (daysUntilExpiry === null || daysUntilExpiry <= 0) {
      return;
    }

    const subject = "Password Expiry Reminder";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Expiry Reminder</h2>
        <p>Hi ${user.name},</p>
        <p>Your password will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}</strong>.</p>
        <p>For security reasons, we require you to change your password regularly.</p>
        <p>Please change your password before it expires to avoid any interruption to your account access.</p>
        <p>
          <a href="${process.env.CLIENT_URL}/account-settings?tab=security" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Change Password Now
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Security Team</p>
      </div>
    `;
    const text = `Hi ${user.name}, Your password will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}. Please change your password at ${process.env.CLIENT_URL}/account-settings?tab=security`;

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send password expiry reminder error:", error);
  }
};

/**
 * Send password expired notification
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
export const sendPasswordExpiredNotification = async (user) => {
  try {
    const subject = "Password Expired - Action Required";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Expired</h2>
        <p>Hi ${user.name},</p>
        <p>Your password has expired for security reasons.</p>
        <p>You will be required to change your password the next time you log in.</p>
        <p>This is a security measure to protect your account.</p>
        <p>
          <a href="${process.env.CLIENT_URL}/login" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Login and Change Password
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Security Team</p>
      </div>
    `;
    const text = `Hi ${user.name}, Your password has expired. Please login at ${process.env.CLIENT_URL}/login to change your password.`;

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send password expired notification error:", error);
  }
};

/**
 * Find users with expiring passwords
 * @param {number} days - Number of days threshold (default 7)
 * @returns {Promise<Array>} Array of users with expiring passwords
 */
export const findUsersWithExpiringPasswords = async (days = 7) => {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + days);

    const users = await User.find({
      passwordExpiresAt: {
        $gte: new Date(),
        $lte: thresholdDate,
      },
      accountStatus: "active",
    });

    return users;
  } catch (error) {
    console.error("Find users with expiring passwords error:", error);
    return [];
  }
};

/**
 * Find users with expired passwords
 * @returns {Promise<Array>} Array of users with expired passwords
 */
export const findUsersWithExpiredPasswords = async () => {
  try {
    const users = await User.find({
      passwordExpiresAt: {
        $lt: new Date(),
      },
      accountStatus: "active",
      forcePasswordChange: false, // Don't send if already forced
    });

    return users;
  } catch (error) {
    console.error("Find users with expired passwords error:", error);
    return [];
  }
};

/**
 * Force password change for user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const forcePasswordChange = async (userId) => {
  try {
    await User.updateOne(
      { _id: userId },
      { forcePasswordChange: true }
    );
    return true;
  } catch (error) {
    console.error("Force password change error:", error);
    return false;
  }
};

/**
 * Clear force password change flag
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
export const clearForcePasswordChange = async (user) => {
  try {
    user.forcePasswordChange = false;
    await user.save();
  } catch (error) {
    console.error("Clear force password change error:", error);
    throw error;
  }
};

export default {
  isPasswordInHistory,
  addPasswordToHistory,
  isPasswordExpired,
  setPasswordExpiry,
  getDaysUntilExpiry,
  isPasswordExpiringSoon,
  sendPasswordExpiryReminder,
  sendPasswordExpiredNotification,
  findUsersWithExpiringPasswords,
  findUsersWithExpiredPasswords,
  forcePasswordChange,
  clearForcePasswordChange,
};
