import { TaskDraft, ITaskDraft } from "../models/TaskDraft";
import mongoose from "mongoose";

export class DraftService {
  /**
   * Save or update a draft for a user
   */
  static async saveDraft(userId: string, formData: any): Promise<ITaskDraft> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const draft = await TaskDraft.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        formData,
        expiresAt,
        lastSaved: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return draft;
  }

  /**
   * Get draft for a user
   */
  static async getDraft(userId: string): Promise<ITaskDraft | null> {
    const draft = await TaskDraft.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Check if draft has expired
    if (draft && draft.expiresAt < new Date()) {
      await this.deleteDraft(userId);
      return null;
    }

    return draft;
  }

  /**
   * Delete draft for a user
   */
  static async deleteDraft(userId: string): Promise<boolean> {
    const result = await TaskDraft.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Clean up expired drafts (for cron job)
   */
  static async cleanupExpiredDrafts(): Promise<number> {
    const result = await TaskDraft.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return result.deletedCount;
  }

  /**
   * Get draft age in hours
   */
  static getDraftAge(draft: ITaskDraft): number {
    const now = new Date().getTime();
    const lastSaved = draft.lastSaved.getTime();
    return Math.floor((now - lastSaved) / (1000 * 60 * 60)); // hours
  }

  /**
   * Validate draft data
   */
  static validateDraftData(formData: any): boolean {
    // Basic validation - ensure it's an object
    if (!formData || typeof formData !== "object") {
      return false;
    }

    // Optional: Add more specific validation rules
    return true;
  }
}
