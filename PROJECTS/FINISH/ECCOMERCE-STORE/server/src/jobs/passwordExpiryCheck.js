import cron from "node-cron";
import {
  findUsersWithExpiringPasswords,
  findUsersWithExpiredPasswords,
  sendPasswordExpiryReminder,
  sendPasswordExpiredNotification,
  forcePasswordChange,
} from "../utils/passwordSecurity.js";

/**
 * Password expiry check job
 * Runs daily at 9 AM to check for expiring/expired passwords
 */
const passwordExpiryCheckJob = cron.schedule(
  "0 9 * * *", // Every day at 9 AM
  async () => {
    try {
      console.log("Starting password expiry check job...");

      // Find users with passwords expiring in 7 days
      const expiringUsers = await findUsersWithExpiringPasswords(7);
      console.log(`Found ${expiringUsers.length} users with expiring passwords`);

      // Send reminders
      for (const user of expiringUsers) {
        try {
          await sendPasswordExpiryReminder(user);
          console.log(`Sent expiry reminder to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error);
        }
      }

      // Find users with expired passwords
      const expiredUsers = await findUsersWithExpiredPasswords();
      console.log(`Found ${expiredUsers.length} users with expired passwords`);

      // Force password change and send notifications
      for (const user of expiredUsers) {
        try {
          await forcePasswordChange(user._id);
          await sendPasswordExpiredNotification(user);
          console.log(`Forced password change for ${user.email}`);
        } catch (error) {
          console.error(`Failed to process expired password for ${user.email}:`, error);
        }
      }

      console.log("Password expiry check job completed");
    } catch (error) {
      console.error("Password expiry check job error:", error);
    }
  },
  {
    scheduled: false, // Don't start automatically
    timezone: "UTC",
  }
);

/**
 * Start the password expiry check job
 */
export const startPasswordExpiryCheck = () => {
  passwordExpiryCheckJob.start();
  console.log("Password expiry check job started (runs daily at 9 AM UTC)");
};

/**
 * Stop the password expiry check job
 */
export const stopPasswordExpiryCheck = () => {
  passwordExpiryCheckJob.stop();
  console.log("Password expiry check job stopped");
};

export default {
  startPasswordExpiryCheck,
  stopPasswordExpiryCheck,
};
