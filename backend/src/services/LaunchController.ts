import { LaunchPhase, ILaunchPhase } from "../models/LaunchPhase";
import { User } from "../models/User";
import { EscrowAccount } from "../models/EscrowAccount";
import { Task } from "../models/Task";
import { DailyFinancialSummary } from "../models/DailyFinancialSummary";

interface PhaseRequirements {
  met: boolean;
  current: number;
  required: number;
}

interface Phase1Status {
  sponsors: PhaseRequirements;
  escrow: PhaseRequirements;
  tasks: PhaseRequirements;
  users: PhaseRequirements;
  allMet: boolean;
}

interface Phase2Status {
  profitDays: PhaseRequirements;
  allMet: boolean;
}

interface LaunchStatus {
  currentPhase: 1 | 2 | 3;
  phase1: Phase1Status;
  phase2: Phase2Status;
  canAdvance: boolean;
}

class LaunchControllerService {
  /**
   * Validate Phase 1 requirements
   * - 5 sponsors
   * - ₦100,000 in escrow
   * - 20 ready tasks
   * - 100 users
   */
  async validatePhase1(): Promise<Phase1Status> {
    // Count sponsors (users with 'sponsor' role)
    const sponsorCount = await User.countDocuments({
      roles: "sponsor",
      status: "active",
    });

    // Calculate total escrow balance
    const escrowAccounts = await EscrowAccount.find({ status: "active" });
    const totalEscrowBalance = escrowAccounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );

    // Count ready tasks (active tasks with available slots)
    const readyTasksCount = await Task.countDocuments({
      status: "active",
      availableSlots: { $gt: 0 },
      expiresAt: { $gt: new Date() },
    });

    // Count total users
    const userCount = await User.countDocuments({
      status: { $in: ["active", "pending_verification"] },
    });

    const sponsors: PhaseRequirements = {
      current: sponsorCount,
      required: 5,
      met: sponsorCount >= 5,
    };

    const escrow: PhaseRequirements = {
      current: totalEscrowBalance,
      required: 100000,
      met: totalEscrowBalance >= 100000,
    };

    const tasks: PhaseRequirements = {
      current: readyTasksCount,
      required: 20,
      met: readyTasksCount >= 20,
    };

    const users: PhaseRequirements = {
      current: userCount,
      required: 100,
      met: userCount >= 100,
    };

    const allMet = sponsors.met && escrow.met && tasks.met && users.met;

    return {
      sponsors,
      escrow,
      tasks,
      users,
      allMet,
    };
  }

  /**
   * Validate Phase 2 requirements
   * - 7 consecutive profitable days
   */
  async validatePhase2(): Promise<Phase2Status> {
    // Get the last 7 days of financial summaries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSummaries = await DailyFinancialSummary.find({
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: -1 })
      .limit(7);

    // Count consecutive profitable days
    let consecutiveProfitDays = 0;
    for (const summary of recentSummaries) {
      if (summary.netProfit > 0) {
        consecutiveProfitDays++;
      } else {
        break; // Stop counting if we hit a non-profitable day
      }
    }

    const profitDays: PhaseRequirements = {
      current: consecutiveProfitDays,
      required: 7,
      met: consecutiveProfitDays >= 7,
    };

    return {
      profitDays,
      allMet: profitDays.met,
    };
  }

  /**
   * Get current phase status with all requirements
   */
  async getCurrentPhaseStatus(): Promise<LaunchStatus> {
    const launchPhase = await (LaunchPhase as any).getInstance();

    const phase1Status = await this.validatePhase1();
    const phase2Status = await this.validatePhase2();

    let canAdvance = false;

    if (launchPhase.currentPhase === 1 && phase1Status.allMet) {
      canAdvance = true;
    } else if (launchPhase.currentPhase === 2 && phase2Status.allMet) {
      canAdvance = true;
    }

    return {
      currentPhase: launchPhase.currentPhase,
      phase1: phase1Status,
      phase2: phase2Status,
      canAdvance,
    };
  }

  /**
   * Advance to the next phase
   */
  async advancePhase(): Promise<ILaunchPhase> {
    const launchPhase = await (LaunchPhase as any).getInstance();
    const status = await this.getCurrentPhaseStatus();

    if (!status.canAdvance) {
      throw new Error(
        `Cannot advance from phase ${launchPhase.currentPhase}. Requirements not met.`
      );
    }

    if (launchPhase.currentPhase === 1) {
      // Advance to Phase 2
      launchPhase.phase1.completed = true;
      launchPhase.phase1.completedAt = new Date();
      launchPhase.phase1.sponsorCount = status.phase1.sponsors.current;
      launchPhase.phase1.escrowBalance = status.phase1.escrow.current;
      launchPhase.phase1.tasksReady = status.phase1.tasks.current;
      launchPhase.phase1.userCount = status.phase1.users.current;
      launchPhase.currentPhase = 2;
    } else if (launchPhase.currentPhase === 2) {
      // Advance to Phase 3
      launchPhase.phase2.completed = true;
      launchPhase.phase2.completedAt = new Date();
      launchPhase.phase2.consecutiveProfitDays =
        status.phase2.profitDays.current;
      launchPhase.currentPhase = 3;
      launchPhase.phase3.launched = true;
      launchPhase.phase3.launchedAt = new Date();
    } else {
      throw new Error("Already at final phase (Phase 3)");
    }

    await launchPhase.save();
    return launchPhase;
  }

  /**
   * Update phase progress (called periodically or on relevant events)
   */
  async updatePhaseProgress(): Promise<ILaunchPhase> {
    const launchPhase = await (LaunchPhase as any).getInstance();
    const status = await this.getCurrentPhaseStatus();

    // Update Phase 1 progress
    launchPhase.phase1.sponsorCount = status.phase1.sponsors.current;
    launchPhase.phase1.escrowBalance = status.phase1.escrow.current;
    launchPhase.phase1.tasksReady = status.phase1.tasks.current;
    launchPhase.phase1.userCount = status.phase1.users.current;

    // Update Phase 2 progress
    launchPhase.phase2.consecutiveProfitDays = status.phase2.profitDays.current;

    await launchPhase.save();
    return launchPhase;
  }

  /**
   * Get user registration limit for current phase
   */
  async getUserRegistrationLimit(): Promise<number> {
    const launchPhase = await (LaunchPhase as any).getInstance();

    switch (launchPhase.currentPhase) {
      case 1:
        return 100;
      case 2:
        return 1000;
      case 3:
        return Infinity; // Unlimited
      default:
        return 100;
    }
  }

  /**
   * Check if new user registrations are allowed
   */
  async canRegisterNewUser(): Promise<{
    allowed: boolean;
    reason?: string;
    currentPhase: number;
    userLimit: number;
    currentUserCount: number;
  }> {
    const launchPhase = await (LaunchPhase as any).getInstance();
    const userLimit = await this.getUserRegistrationLimit();
    const currentUserCount = await User.countDocuments({
      status: { $in: ["active", "pending_verification"] },
    });

    const allowed = currentUserCount < userLimit;

    return {
      allowed,
      reason: allowed
        ? undefined
        : `User registration limit reached for Phase ${launchPhase.currentPhase}. Please join our waitlist.`,
      currentPhase: launchPhase.currentPhase,
      userLimit,
      currentUserCount,
    };
  }
}

export default new LaunchControllerService();
