import User from "../models/User.js";
import Session from "../models/Session.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import ActivityLog from "../models/ActivityLog.js";
import LoginAttempt from "../models/LoginAttempt.js";
import TrustedDevice from "../models/TrustedDevice.js";
import { sendEmail } from "./sendEmail.js";

/**
 * Deactivate user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export const deactivateAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Set account status to deactivated
    user.accountStatus = "deactivated";
    await user.save();

    // Invalidate all sessions
    await Session.updateMany(
      { user: userId },
      { isActive: false }
    );

    return {
      success: true,
      message: "Account deactivated successfully",
    };
  } catch (error) {
    console.error("Deactivate account error:", error);
    throw error;
  }
};

/**
 * Reactivate user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export const reactivateAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Set account status back to active
    user.accountStatus = "active";
    user.deletionScheduledFor = undefined;
    await user.save();

    return {
      success: true,
      message: "Account reactivated successfully",
    };
  } catch (error) {
    console.error("Reactivate account error:", error);
    throw error;
  }
};

/**
 * Schedule account for deletion
 * @param {string} userId - User ID
 * @param {number} days - Days until deletion (default 30)
 * @returns {Promise<Object>} Result object
 */
export const scheduleAccountDeletion = async (userId, days = 30) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Set deletion date
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + days);

    user.accountStatus = "scheduled_deletion";
    user.deletionScheduledFor = deletionDate;
    await user.save();

    // Invalidate all sessions
    await Session.updateMany(
      { user: userId },
      { isActive: false }
    );

    return {
      success: true,
      message: `Account scheduled for deletion on ${deletionDate.toLocaleDateString()}`,
      deletionDate,
    };
  } catch (error) {
    console.error("Schedule account deletion error:", error);
    throw error;
  }
};

/**
 * Cancel scheduled account deletion
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export const cancelAccountDeletion = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (user.accountStatus !== "scheduled_deletion") {
      throw new Error("Account is not scheduled for deletion");
    }

    // Cancel deletion
    user.accountStatus = "active";
    user.deletionScheduledFor = undefined;
    await user.save();

    return {
      success: true,
      message: "Account deletion cancelled successfully",
    };
  } catch (error) {
    console.error("Cancel account deletion error:", error);
    throw error;
  }
};

/**
 * Permanently delete user account and data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export const deleteUserAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Anonymize orders (keep for business records)
    await Order.updateMany(
      { user: userId },
      {
        $set: {
          "shippingAddress.fullName": "Deleted User",
          "shippingAddress.phone": "***",
          "shippingAddress.email": "deleted@example.com",
        },
      }
    );

    // Delete user-generated content
    await Review.deleteMany({ user: userId });
    await ActivityLog.deleteMany({ user: userId });
    await LoginAttempt.deleteMany({ user: userId });
    await Session.deleteMany({ user: userId });
    await TrustedDevice.deleteMany({ user: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    return {
      success: true,
      message: "Account and personal data deleted successfully",
    };
  } catch (error) {
    console.error("Delete user account error:", error);
    throw error;
  }
};

/**
 * Find accounts scheduled for deletion
 * @returns {Promise<Array>} Array of users scheduled for deletion
 */
export const findAccountsScheduledForDeletion = async () => {
  try {
    const now = new Date();
    
    const users = await User.find({
      accountStatus: "scheduled_deletion",
      deletionScheduledFor: { $lte: now },
    });

    return users;
  } catch (error) {
    console.error("Find accounts scheduled for deletion error:", error);
    return [];
  }
};

/**
 * Send account deactivation confirmation email
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
export const sendDeactivationEmail = async (user) => {
  try {
    const subject = "Account Deactivated";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Deactivated</h2>
        <p>Hi ${user.name},</p>
        <p>Your account has been deactivated as requested.</p>
        <p>You can reactivate your account at any time by logging in again.</p>
        <p>If you didn't request this, please contact our support team immediately.</p>
        <p>Best regards,<br>The Support Team</p>
      </div>
    `;
    const text = `Hi ${user.name}, Your account has been deactivated. You can reactivate it by logging in again.`;

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send deactivation email error:", error);
  }
};

/**
 * Send account deletion scheduled email
 * @param {Object} user - User object
 * @param {Date} deletionDate - Scheduled deletion date
 * @returns {Promise<void>}
 */
export const sendDeletionScheduledEmail = async (user, deletionDate) => {
  try {
    const subject = "Account Deletion Scheduled";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Deletion Scheduled</h2>
        <p>Hi ${user.name},</p>
        <p>Your account has been scheduled for deletion on <strong>${deletionDate.toLocaleDateString()}</strong>.</p>
        <p>You have 30 days to cancel this request. After that, your account and all personal data will be permanently deleted.</p>
        <p>To cancel the deletion, log in to your account and go to Account Settings.</p>
        <p>
          <a href="${process.env.CLIENT_URL}/account-settings" 
             style="display: inline-block; padding: 12px 24px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Cancel Deletion
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Support Team</p>
      </div>
    `;
    const text = `Hi ${user.name}, Your account is scheduled for deletion on ${deletionDate.toLocaleDateString()}. You have 30 days to cancel this request.`;

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send deletion scheduled email error:", error);
  }
};

/**
 * Send account deletion cancelled email
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
export const sendDeletionCancelledEmail = async (user) => {
  try {
    const subject = "Account Deletion Cancelled";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Deletion Cancelled</h2>
        <p>Hi ${user.name},</p>
        <p>Your account deletion request has been cancelled successfully.</p>
        <p>Your account is now active and you can continue using our services.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>The Support Team</p>
      </div>
    `;
    const text = `Hi ${user.name}, Your account deletion has been cancelled. Your account is now active.`;

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send deletion cancelled email error:", error);
  }
};

/**
 * Send final account deletion confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<void>}
 */
export const sendFinalDeletionEmail = async (email, name) => {
  try {
    const subject = "Account Deleted";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Deleted</h2>
        <p>Hi ${name},</p>
        <p>Your account and all personal data have been permanently deleted as requested.</p>
        <p>We're sorry to see you go. If you change your mind, you're always welcome to create a new account.</p>
        <p>Thank you for being part of our community.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;
    const text = `Hi ${name}, Your account has been permanently deleted. Thank you for being part of our community.`;

    await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Send final deletion email error:", error);
  }
};

export default {
  deactivateAccount,
  reactivateAccount,
  scheduleAccountDeletion,
  cancelAccountDeletion,
  deleteUserAccount,
  findAccountsScheduledForDeletion,
  sendDeactivationEmail,
  sendDeletionScheduledEmail,
  sendDeletionCancelledEmail,
  sendFinalDeletionEmail,
};
