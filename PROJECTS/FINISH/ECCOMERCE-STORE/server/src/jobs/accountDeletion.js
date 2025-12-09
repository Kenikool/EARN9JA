import cron from "node-cron";
import {
  findAccountsScheduledForDeletion,
  deleteUserAccount,
  sendFinalDeletionEmail,
} from "../utils/accountManagement.js";

/**
 * Account deletion job
 * Runs daily at midnight to process scheduled account deletions
 */
const accountDeletionJob = cron.schedule(
  "0 0 * * *", // Every day at midnight
  async () => {
    try {
      console.log("Starting account deletion job...");

      // Find accounts scheduled for deletion
      const users = await findAccountsScheduledForDeletion();
      console.log(`Found ${users.length} accounts scheduled for deletion`);

      // Process each account
      for (const user of users) {
        try {
          const email = user.email;
          const name = user.name;

          // Delete account and all data
          await deleteUserAccount(user._id);
          console.log(`Deleted account: ${email}`);

          // Send final confirmation email
          await sendFinalDeletionEmail(email, name);
        } catch (error) {
          console.error(`Failed to delete account ${user.email}:`, error);
        }
      }

      console.log("Account deletion job completed");
    } catch (error) {
      console.error("Account deletion job error:", error);
    }
  },
  {
    scheduled: false, // Don't start automatically
    timezone: "UTC",
  }
);

/**
 * Start the account deletion job
 */
export const startAccountDeletionJob = () => {
  accountDeletionJob.start();
  console.log("Account deletion job started (runs daily at midnight UTC)");
};

/**
 * Stop the account deletion job
 */
export const stopAccountDeletionJob = () => {
  accountDeletionJob.stop();
  console.log("Account deletion job stopped");
};

export default {
  startAccountDeletionJob,
  stopAccountDeletionJob,
};
