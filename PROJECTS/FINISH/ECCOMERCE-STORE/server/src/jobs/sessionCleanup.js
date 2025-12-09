import { cleanupExpiredSessions } from "../utils/sessionManager.js";

/**
 * Background job to clean up expired sessions
 * Runs periodically to remove inactive and expired sessions
 */
export const runSessionCleanup = async () => {
  try {
    console.log("🧹 Running session cleanup job...");
    const deletedCount = await cleanupExpiredSessions();
    console.log(`✅ Session cleanup complete. Removed ${deletedCount} expired sessions.`);
    return deletedCount;
  } catch (error) {
    console.error("❌ Session cleanup job error:", error);
    return 0;
  }
};

/**
 * Start session cleanup scheduler
 * Runs every hour
 */
export const startSessionCleanupScheduler = () => {
  // Run immediately on start
  runSessionCleanup();

  // Then run every hour
  setInterval(runSessionCleanup, 60 * 60 * 1000);
  
  console.log("⏰ Session cleanup scheduler started (runs every hour)");
};

export default {
  runSessionCleanup,
  startSessionCleanupScheduler,
};
