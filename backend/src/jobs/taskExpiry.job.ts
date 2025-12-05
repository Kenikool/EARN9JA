import cron from "node-cron";
import { Task } from "../models/Task.js";

/**
 * Cron job to check and expire tasks
 * Runs every hour to check for expired tasks and update their status
 */
export const startTaskExpiryJob = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🕐 Running task expiry check...");

      const now = new Date();

      // Find all active or paused tasks that have expired
      const expiredTasks = await Task.find({
        status: { $in: ["active", "paused"] },
        expiresAt: { $lte: now },
      });

      if (expiredTasks.length === 0) {
        console.log("✅ No expired tasks found");
        return;
      }

      console.log(`📋 Found ${expiredTasks.length} expired tasks`);

      // Update all expired tasks to expired status
      const updatePromises = expiredTasks.map(async (task) => {
        task.status = "expired";
        await task.save();
        console.log(`⏰ Task expired: ${task._id} - ${task.title}`);
      });

      await Promise.all(updatePromises);

      console.log(`✅ Successfully expired ${expiredTasks.length} tasks`);
    } catch (error) {
      console.error("❌ Error in task expiry job:", error);
    }
  });

  console.log("✅ Task expiry job scheduled (runs hourly)");
};
