import cron from "node-cron";
import { cleanupExpiredExports } from "../utils/dataExport.js";

/**
 * Export cleanup job
 * Runs daily at 2 AM to delete expired export files
 */
const exportCleanupJob = cron.schedule(
  "0 2 * * *", // Every day at 2 AM
  async () => {
    try {
      console.log("Starting export cleanup job...");
      
      const deletedCount = await cleanupExpiredExports();
      console.log(`Export cleanup completed. Deleted ${deletedCount} expired files.`);
    } catch (error) {
      console.error("Export cleanup job error:", error);
    }
  },
  {
    scheduled: false,
    timezone: "UTC",
  }
);

/**
 * Start the export cleanup job
 */
export const startExportCleanup = () => {
  exportCleanupJob.start();
  console.log("Export cleanup job started (runs daily at 2 AM UTC)");
};

/**
 * Stop the export cleanup job
 */
export const stopExportCleanup = () => {
  exportCleanupJob.stop();
  console.log("Export cleanup job stopped");
};

export default {
  startExportCleanup,
  stopExportCleanup,
};
