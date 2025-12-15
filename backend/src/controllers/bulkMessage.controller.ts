import { Request, Response } from "express";
import { bulkMessageService } from "../services/BulkMessageService.js";

/**
 * Create a bulk message
 */
export const createMessage = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const messageData = req.body;

    const messageId = await bulkMessageService.createMessage(
      messageData,
      adminId
    );

    res.status(201).json({
      success: true,
      message: "Bulk message created successfully",
      data: { messageId },
    });
  } catch (error: any) {
    console.error("Create message error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create message",
    });
  }
};

/**
 * Send a bulk message
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await bulkMessageService.sendMessage(id);

    res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

/**
 * Schedule a bulk message
 */
export const scheduleMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledFor } = req.body;

    if (!scheduledFor) {
      return res.status(400).json({
        success: false,
        message: "scheduledFor is required",
      });
    }

    await bulkMessageService.scheduleMessage(id, new Date(scheduledFor));

    res.json({
      success: true,
      message: "Message scheduled successfully",
    });
  } catch (error: any) {
    console.error("Schedule message error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to schedule message",
    });
  }
};

/**
 * Cancel a scheduled message
 */
export const cancelMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await bulkMessageService.cancelScheduledMessage(id);

    res.json({
      success: true,
      message: "Scheduled message cancelled successfully",
    });
  } catch (error: any) {
    console.error("Cancel message error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel message",
    });
  }
};

/**
 * Get message status
 */
export const getMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await bulkMessageService.getMessageStatus(id);

    res.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("Get message status error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to get message status",
    });
  }
};

/**
 * Get all messages
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const status = req.query.status as string;

    const result = await bulkMessageService.getMessages(page, limit, status);

    res.json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get messages",
    });
  }
};

/**
 * Create a message template
 */
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const templateData = {
      ...req.body,
      createdBy: adminId,
    };

    const templateId = await bulkMessageService.createTemplate(templateData);

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: { templateId },
    });
  } catch (error: any) {
    console.error("Create template error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create template",
    });
  }
};

/**
 * Get all templates
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await bulkMessageService.getTemplates();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error("Get templates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get templates",
    });
  }
};

/**
 * Update a template
 */
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await bulkMessageService.updateTemplate(id, updates);

    res.json({
      success: true,
      message: "Template updated successfully",
    });
  } catch (error: any) {
    console.error("Update template error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update template",
    });
  }
};

/**
 * Delete a template
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await bulkMessageService.deleteTemplate(id);

    res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete template error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete template",
    });
  }
};
