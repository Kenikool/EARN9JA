import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { gamificationController } from "../controllers/gamification.controller.js";

const router = Router();

// Daily Bonus routes
router.get(
  "/daily-bonus/status",
  authenticate,
  gamificationController.getDailyBonusStatus
);
router.post(
  "/daily-bonus/claim",
  authenticate,
  gamificationController.claimDailyBonus
);
router.get(
  "/daily-bonus/stats",
  authenticate,
  gamificationController.getStreakStats
);

// Spin Wheel routes
router.get("/spin/status", authenticate, gamificationController.getSpinStatus);
router.post("/spin", authenticate, gamificationController.spin);
router.post("/spin/extra", authenticate, gamificationController.grantExtraSpin);
router.get("/spin/stats", authenticate, gamificationController.getSpinStats);

// Challenges routes
router.get("/challenges", authenticate, gamificationController.getChallenges);
router.post(
  "/challenges/:challengeId/claim",
  authenticate,
  gamificationController.claimChallengeReward
);

// Leaderboard routes
router.get("/leaderboard", authenticate, gamificationController.getLeaderboard);

// Achievements routes
router.get(
  "/achievements",
  authenticate,
  gamificationController.getAchievements
);

// Reputation routes
router.get("/reputation", authenticate, gamificationController.getReputation);

export default router;
