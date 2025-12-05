import { Request, Response } from "express";
import { SupportService } from "../services/SupportService";
import { validationResult } from "express-validator";

export class SupportController {
  /**
   * Create support ticket
   */
  static async createTicket(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { subject, description, category, priority, attachments } =
        req.body;
      const userId = req.user!.id;

      const ticket = await SupportService.createTicket({
        userId,
        subject,
        description,
        category,
        priority,
        attachments,
      });

      res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        data: ticket,
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create support ticket",
      });
    }
  }

  /**
   * Get user's tickets
   */
  static async getUserTickets(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      const tickets = await SupportService.getUserTickets(
        userId,
        status as string
      );

      res.json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const userId = req.user!.roles.includes("admin")
        ? undefined
        : req.user!._id.toString();

      const ticket = await SupportService.getTicketById(ticketId, userId);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error fetching ticket:", error);
      res.status(error.message === "Ticket not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to fetch ticket",
      });
    }
  }

  /**
   * Add response to ticket
   */
  static async addResponse(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { ticketId } = req.params;
      const { message } = req.body;
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.roles.includes("admin");

      const ticket = await SupportService.addResponse({
        ticketId,
        userId,
        message,
        isAdmin,
      });

      res.json({
        success: true,
        message: "Response added successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error adding response:", error);
      res.status(error.message === "Ticket not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to add response",
      });
    }
  }

  /**
   * Update ticket status (admin)
   */
  static async updateTicketStatus(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;
      const adminId = req.user!.id;

      const ticket = await SupportService.updateTicketStatus(
        ticketId,
        status,
        adminId
      );

      res.json({
        success: true,
        message: "Ticket status updated successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error updating ticket status:", error);
      res.status(error.message === "Ticket not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to update ticket status",
      });
    }
  }

  /**
   * Assign ticket to admin
   */
  static async assignTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { adminId } = req.body;

      const ticket = await SupportService.assignTicket(ticketId, adminId);

      res.json({
        success: true,
        message: "Ticket assigned successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error assigning ticket:", error);
      res.status(error.message === "Ticket not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to assign ticket",
      });
    }
  }

  /**
   * Get all tickets (admin)
   */
  static async getAllTickets(req: Request, res: Response) {
    try {
      const { status, priority, category, assignedTo, page, limit } = req.query;

      const result = await SupportService.getAllTickets({
        status: status as string,
        priority: priority as string,
        category: category as string,
        assignedTo: assignedTo as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }
  }

  /**
   * Get FAQs
   */
  static async getFAQs(req: Request, res: Response) {
    try {
      const { category, search } = req.query;

      const faqs = await SupportService.getFAQs(
        category as string,
        search as string
      );

      res.json({
        success: true,
        data: faqs,
      });
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch FAQs",
      });
    }
  }

  /**
   * Get FAQ by ID
   */
  static async getFAQById(req: Request, res: Response) {
    try {
      const { faqId } = req.params;

      const faq = await SupportService.getFAQById(faqId);

      res.json({
        success: true,
        data: faq,
      });
    } catch (error: any) {
      console.error("Error fetching FAQ:", error);
      res.status(error.message === "FAQ not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to fetch FAQ",
      });
    }
  }

  /**
   * Rate FAQ
   */
  static async rateFAQ(req: Request, res: Response) {
    try {
      const { faqId } = req.params;
      const { helpful } = req.body;

      const faq = await SupportService.rateFAQ(faqId, helpful);

      res.json({
        success: true,
        message: "Thank you for your feedback",
        data: faq,
      });
    } catch (error: any) {
      console.error("Error rating FAQ:", error);
      res.status(error.message === "FAQ not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to rate FAQ",
      });
    }
  }

  /**
   * Create FAQ (admin)
   */
  static async createFAQ(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { question, answer, category, order, tags } = req.body;

      const faq = await SupportService.createFAQ({
        question,
        answer,
        category,
        order,
        tags,
      });

      res.status(201).json({
        success: true,
        message: "FAQ created successfully",
        data: faq,
      });
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create FAQ",
      });
    }
  }

  /**
   * Update FAQ (admin)
   */
  static async updateFAQ(req: Request, res: Response) {
    try {
      const { faqId } = req.params;
      const updates = req.body;

      const faq = await SupportService.updateFAQ(faqId, updates);

      res.json({
        success: true,
        message: "FAQ updated successfully",
        data: faq,
      });
    } catch (error: any) {
      console.error("Error updating FAQ:", error);
      res.status(error.message === "FAQ not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to update FAQ",
      });
    }
  }

  /**
   * Delete FAQ (admin)
   */
  static async deleteFAQ(req: Request, res: Response) {
    try {
      const { faqId } = req.params;

      await SupportService.deleteFAQ(faqId);

      res.json({
        success: true,
        message: "FAQ deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting FAQ:", error);
      res.status(error.message === "FAQ not found" ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to delete FAQ",
      });
    }
  }

  /**
   * Get support statistics (admin)
   */
  static async getSupportStatistics(req: Request, res: Response) {
    try {
      const stats = await SupportService.getSupportStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching support statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch support statistics",
      });
    }
  }
}
