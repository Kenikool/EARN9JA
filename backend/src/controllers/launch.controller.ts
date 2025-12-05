import { Request, Response } from "express";
import LaunchController from "../services/LaunchController.js";

class LaunchControllerClass {
  /**
   * GET /api/admin/launch-status
   * Get current launch phase status and progress
   */
  async getLaunchStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await LaunchController.getCurrentPhaseStatus();

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("❌ Get launch status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get launch status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/admin/advance-phase
   * Manually advance to the next phase (admin only)
   */
  async advancePhase(_req: Request, res: Response): Promise<void> {
    try {
      const launchPhase = await LaunchController.advancePhase();

      res.status(200).json({
        success: true,
        message: `Successfully advanced to Phase ${launchPhase.currentPhase}`,
        data: launchPhase,
      });
    } catch (error) {
      console.error("❌ Advance phase error:", error);
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to advance phase",
      });
    }
  }

  /**
   * POST /api/admin/update-phase-progress
   * Update phase progress metrics
   */
  async updatePhaseProgress(_req: Request, res: Response): Promise<void> {
    try {
      const launchPhase = await LaunchController.updatePhaseProgress();

      res.status(200).json({
        success: true,
        message: "Phase progress updated successfully",
        data: launchPhase,
      });
    } catch (error) {
      console.error("❌ Update phase progress error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update phase progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * GET /api/launch/registration-status
   * Check if new user registrations are allowed (public endpoint)
   */
  async getRegistrationStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await LaunchController.canRegisterNewUser();

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("❌ Get registration status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get registration status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const launchController = new LaunchControllerClass();
