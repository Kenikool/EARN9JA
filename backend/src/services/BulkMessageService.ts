import { BulkMessage, IBulkMessage } from "../models/BulkMessage.js";
import { MessageTemplate } from "../models/MessageTemplate.js";
import { User } from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

interface RecipientFilters {
  status?: ("active" | "suspended" | "banned")[];
  roles?: ("service_worker" | "sponsor" | "admin")[];
  kycVerified?: boolean;
  registeredAfter?: Date;
  registeredBefore?: Date;
}

interface BulkMessageInput {
  title: string;
  body: string;
  type: "in_app" | "push" | "both";
  targetAudience: {
    type: "all" | "filtered" | "segment";
    filters?: RecipientFilters;
    segmentId?: string;
  };
  scheduledFor?: Date;
}

interface MessageRateLimitTracker {
  [adminId: string]: {
    count: number;
    resetAt: Date;
  };
}

class BulkMessageService {
  private rateLimitTracker: MessageRateLimitTracker = {};
  private readonly MAX_MESSAGES_PER_HOUR = 5;
  private readonly BATCH_SIZE = 1000;
  private readonly MAX_RECIPIENTS_WITHOUT_CONFIRMATION = 10000;

  /**
   * Create a bulk message
   */
  async createMessage(
    messageData: BulkMessageInput,
    adminId: string
  ): Promise<string> {
    try {
      // Check rate limit
      this.checkRateLimit(adminId);

      // Estimate recipient count
      const recipientCount = await this.estimateRecipientCount(
        messageData.targetAudience
      );

      // Validate recipient count
      if (recipientCount > this.MAX_RECIPIENTS_WITHOUT_CONFIRMATION) {
        throw new Error(
          `Message targets ${recipientCount} users. Maximum ${this.MAX_RECIPIENTS_WITHOUT_CONFIRMATION} without confirmation.`
        );
      }

      if (recipientCount === 0) {
        throw new Error("No recipients found matching the criteria");
      }

      // Create message
      const message = new BulkMessage({
        title: messageData.title,
        body: messageData.body,
        type: messageData.type,
        targetAudience: messageData.targetAudience,
        scheduledFor: messageData.scheduledFor,
        status: messageData.scheduledFor ? "scheduled" : "draft",
        delivery: {
          totalRecipients: recipientCount,
          sent: 0,
          delivered: 0,
          failed: 0,
          read: 0,
        },
        createdBy: new mongoose.Types.ObjectId(adminId),
      });

      await message.save();

      console.log(`✅ Bulk message created: ${message._id}`);
      return message._id.toString();
    } catch (error) {
      console.error("Create message error:", error);
      throw error;
    }
  }

  /**
   * Send a bulk message immediately
   */
  async sendMessage(messageId: string): Promise<void> {
    try {
      const message = await BulkMessage.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      if (message.status === "sent" || message.status === "sending") {
        throw new Error("Message already sent or sending");
      }

      if (message.status === "cancelled") {
        throw new Error("Cannot send cancelled message");
      }

      // Update status to sending
      message.status = "sending";
      message.sentAt = new Date();
      await message.save();

      // Get recipients
      const recipients = await this.filterRecipients(message.targetAudience);

      // Process in batches
      await this.processRecipientBatch(recipients, message);

      // Update status to sent
      message.status = "sent";
      message.completedAt = new Date();
      await message.save();

      // Update rate limit
      this.updateRateLimit(message.createdBy.toString());

      console.log(
        `✅ Bulk message sent: ${messageId} (${recipients.length} recipients)`
      );
    } catch (error) {
      console.error("Send message error:", error);
      // Update message status to failed
      await BulkMessage.findByIdAndUpdate(messageId, {
        status: "draft",
      });
      throw error;
    }
  }

  /**
   * Schedule a message for future delivery
   */
  async scheduleMessage(messageId: string, scheduledTime: Date): Promise<void> {
    try {
      const message = await BulkMessage.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      if (scheduledTime <= new Date()) {
        throw new Error("Scheduled time must be in the future");
      }

      message.scheduledFor = scheduledTime;
      message.status = "scheduled";
      await message.save();

      console.log(`✅ Message scheduled for ${scheduledTime}`);
    } catch (error) {
      console.error("Schedule message error:", error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(messageId: string): Promise<void> {
    try {
      const message = await BulkMessage.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      if (message.status !== "scheduled") {
        throw new Error("Only scheduled messages can be cancelled");
      }

      message.status = "cancelled";
      await message.save();

      console.log(`✅ Scheduled message cancelled: ${messageId}`);
    } catch (error) {
      console.error("Cancel message error:", error);
      throw error;
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<IBulkMessage> {
    try {
      const message = await BulkMessage.findById(messageId)
        .populate("createdBy", "profile.firstName profile.lastName email")
        .lean();

      if (!message) {
        throw new Error("Message not found");
      }

      return message as unknown as IBulkMessage;
    } catch (error) {
      console.error("Get message status error:", error);
      throw error;
    }
  }

  /**
   * Get all messages with pagination
   */
  async getMessages(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{
    messages: IBulkMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (status) {
        query.status = status;
      }

      const messages = await BulkMessage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "profile.firstName profile.lastName email")
        .lean();

      const total = await BulkMessage.countDocuments(query);

      return {
        messages: messages as unknown as IBulkMessage[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get messages error:", error);
      throw error;
    }
  }

  /**
   * Create a message template
   */
  async createTemplate(templateData: {
    name: string;
    title: string;
    body: string;
    variables: string[];
    targetAudience?: any;
    createdBy: string;
  }): Promise<string> {
    try {
      const template = new MessageTemplate(templateData);
      await template.save();

      console.log(`✅ Template created: ${template.name}`);
      return template._id.toString();
    } catch (error) {
      console.error("Create template error:", error);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<any[]> {
    try {
      const templates = await MessageTemplate.find()
        .sort({ createdAt: -1 })
        .lean();

      return templates;
    } catch (error) {
      console.error("Get templates error:", error);
      throw error;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<{
      name: string;
      title: string;
      body: string;
      variables: string[];
      targetAudience: any;
    }>
  ): Promise<void> {
    try {
      await MessageTemplate.findByIdAndUpdate(templateId, updates);
      console.log(`✅ Template updated: ${templateId}`);
    } catch (error) {
      console.error("Update template error:", error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await MessageTemplate.findByIdAndDelete(templateId);
      console.log(`✅ Template deleted: ${templateId}`);
    } catch (error) {
      console.error("Delete template error:", error);
      throw error;
    }
  }

  /**
   * Replace template variables in message
   */
  replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, variables[key]);
    });
    return result;
  }

  /**
   * Filter recipients based on targeting criteria
   */
  private async filterRecipients(targetAudience: any): Promise<string[]> {
    try {
      const query: any = {};

      if (targetAudience.type === "all") {
        // Get all active users
        query.status = "active";
      } else if (targetAudience.type === "filtered" && targetAudience.filters) {
        const filters = targetAudience.filters;

        if (filters.status && filters.status.length > 0) {
          query.status = { $in: filters.status };
        }

        if (filters.roles && filters.roles.length > 0) {
          query.roles = { $in: filters.roles };
        }

        if (filters.kycVerified !== undefined) {
          query.isKYCVerified = filters.kycVerified;
        }

        if (filters.registeredAfter || filters.registeredBefore) {
          query.createdAt = {};
          if (filters.registeredAfter) {
            query.createdAt.$gte = filters.registeredAfter;
          }
          if (filters.registeredBefore) {
            query.createdAt.$lte = filters.registeredBefore;
          }
        }
      }

      const users = await User.find(query).select("_id").lean();
      return users.map((u) => u._id.toString());
    } catch (error) {
      console.error("Filter recipients error:", error);
      throw error;
    }
  }

  /**
   * Estimate recipient count
   */
  private async estimateRecipientCount(targetAudience: any): Promise<number> {
    try {
      const recipients = await this.filterRecipients(targetAudience);
      return recipients.length;
    } catch (error) {
      console.error("Estimate recipient count error:", error);
      throw error;
    }
  }

  /**
   * Process recipients in batches
   */
  private async processRecipientBatch(
    recipients: string[],
    message: IBulkMessage
  ): Promise<void> {
    try {
      const totalBatches = Math.ceil(recipients.length / this.BATCH_SIZE);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * this.BATCH_SIZE;
        const end = Math.min(start + this.BATCH_SIZE, recipients.length);
        const batch = recipients.slice(start, end);

        // Create in-app notifications for batch
        if (message.type === "in_app" || message.type === "both") {
          const notifications = batch.map((userId) => ({
            userId: new mongoose.Types.ObjectId(userId),
            type: "system",
            title: message.title,
            message: message.body,
            isRead: false,
            createdAt: new Date(),
          }));

          await Notification.insertMany(notifications);
        }

        // Update delivery stats
        await BulkMessage.findByIdAndUpdate(message._id, {
          $inc: {
            "delivery.sent": batch.length,
            "delivery.delivered": batch.length,
          },
        });

        console.log(
          `📤 Processed batch ${i + 1}/${totalBatches} (${
            batch.length
          } recipients)`
        );

        // Rate limiting: 1000 messages per minute
        if (i < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
      }
    } catch (error) {
      console.error("Process batch error:", error);
      throw error;
    }
  }

  /**
   * Check rate limit for admin
   */
  private checkRateLimit(adminId: string): void {
    const now = new Date();
    const tracker = this.rateLimitTracker[adminId];

    if (tracker) {
      if (now < tracker.resetAt) {
        if (tracker.count >= this.MAX_MESSAGES_PER_HOUR) {
          const minutesLeft = Math.ceil(
            (tracker.resetAt.getTime() - now.getTime()) / 60000
          );
          throw new Error(
            `Rate limit exceeded. You can send ${this.MAX_MESSAGES_PER_HOUR} messages per hour. Try again in ${minutesLeft} minutes.`
          );
        }
      } else {
        // Reset tracker
        delete this.rateLimitTracker[adminId];
      }
    }
  }

  /**
   * Update rate limit tracker
   */
  private updateRateLimit(adminId: string): void {
    const now = new Date();
    const resetAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    if (this.rateLimitTracker[adminId]) {
      this.rateLimitTracker[adminId].count++;
    } else {
      this.rateLimitTracker[adminId] = {
        count: 1,
        resetAt,
      };
    }
  }

  /**
   * Process scheduled messages (called by cron job)
   */
  async processScheduledMessages(): Promise<void> {
    try {
      const now = new Date();
      const scheduledMessages = await BulkMessage.find({
        status: "scheduled",
        scheduledFor: { $lte: now },
      });

      console.log(
        `📅 Processing ${scheduledMessages.length} scheduled messages`
      );

      for (const message of scheduledMessages) {
        try {
          await this.sendMessage(message._id.toString());
        } catch (error) {
          console.error(
            `Failed to send scheduled message ${message._id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Process scheduled messages error:", error);
    }
  }
}

export const bulkMessageService = new BulkMessageService();
