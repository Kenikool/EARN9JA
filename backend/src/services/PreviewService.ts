import crypto from "crypto";

interface TaskPreviewData {
  title: string;
  description: string;
  category: string;
  platform?: string;
  taskType?: string;
  reward: number;
  estimatedTime?: number;
  requirements: string[];
  targetUrl?: string;
  imageUrls?: string[];
}

interface PreviewResponse {
  previewId: string;
  previewUrl: string;
  expiresAt: Date;
  taskData: TaskPreviewData;
}

// In-memory storage for previews (in production, use Redis)
const previewStore = new Map<
  string,
  { data: TaskPreviewData; expiresAt: Date }
>();

export class PreviewService {
  /**
   * Generate a preview for task data
   */
  static generatePreview(taskData: TaskPreviewData): PreviewResponse {
    // Generate unique preview ID
    const previewId = crypto.randomBytes(16).toString("hex");

    // Set expiration (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store preview data
    previewStore.set(previewId, {
      data: taskData,
      expiresAt,
    });

    // Generate preview URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:8081";
    const previewUrl = `${baseUrl}/preview/${previewId}`;

    return {
      previewId,
      previewUrl,
      expiresAt,
      taskData,
    };
  }

  /**
   * Get preview by ID
   */
  static getPreview(previewId: string): TaskPreviewData | null {
    const preview = previewStore.get(previewId);

    if (!preview) {
      return null;
    }

    // Check if expired
    if (preview.expiresAt < new Date()) {
      previewStore.delete(previewId);
      return null;
    }

    return preview.data;
  }

  /**
   * Delete preview
   */
  static deletePreview(previewId: string): boolean {
    return previewStore.delete(previewId);
  }

  /**
   * Cleanup expired previews
   */
  static cleanupExpiredPreviews(): number {
    const now = new Date();
    let deletedCount = 0;

    for (const [previewId, preview] of previewStore.entries()) {
      if (preview.expiresAt < now) {
        previewStore.delete(previewId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Simulate worker perspective
   */
  static simulateWorkerView(
    taskData: TaskPreviewData,
    userType: "new" | "experienced" = "new"
  ): any {
    const baseView = {
      ...taskData,
      // Add worker-specific calculations
      estimatedEarnings: taskData.reward,
      difficulty: this.calculateDifficulty(taskData, userType),
      completionTime: taskData.estimatedTime || 5,
    };

    // Add experience-based insights
    if (userType === "experienced") {
      return {
        ...baseView,
        tips: this.generateTips(taskData),
        similarTasksCompleted: Math.floor(Math.random() * 50) + 10,
        averageCompletionTime: (taskData.estimatedTime || 5) * 0.8,
      };
    }

    return {
      ...baseView,
      helpText: this.generateHelpText(taskData),
      tutorialAvailable: true,
    };
  }

  /**
   * Calculate task difficulty
   */
  private static calculateDifficulty(
    taskData: TaskPreviewData,
    userType: "new" | "experienced"
  ): "easy" | "medium" | "hard" {
    let difficultyScore = 0;

    // Requirements complexity
    difficultyScore += taskData.requirements.length * 10;

    // Time requirement
    if (taskData.estimatedTime) {
      if (taskData.estimatedTime > 15) difficultyScore += 30;
      else if (taskData.estimatedTime > 5) difficultyScore += 15;
    }

    // URL requirement
    if (taskData.targetUrl) difficultyScore += 10;

    // Adjust for user experience
    if (userType === "experienced") {
      difficultyScore *= 0.7;
    }

    if (difficultyScore < 30) return "easy";
    if (difficultyScore < 60) return "medium";
    return "hard";
  }

  /**
   * Generate tips for experienced users
   */
  private static generateTips(taskData: TaskPreviewData): string[] {
    const tips: string[] = [];

    if (taskData.platform === "Instagram") {
      tips.push("Use Instagram app for faster completion");
      tips.push("Take screenshots immediately after completing");
    }

    if (taskData.requirements.length > 3) {
      tips.push("Read all requirements carefully before starting");
    }

    if (taskData.targetUrl) {
      tips.push("Copy the URL before opening to avoid errors");
    }

    return tips;
  }

  /**
   * Generate help text for new users
   */
  private static generateHelpText(taskData: TaskPreviewData): string {
    return `This task requires you to ${
      taskData.taskType?.toLowerCase() || "complete an action"
    } on ${
      taskData.platform || "a platform"
    }. Follow each requirement carefully and submit proof when done.`;
  }
}
