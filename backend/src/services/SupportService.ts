import { SupportTicket } from "../models/SupportTicket";
import { FAQ } from "../models/FAQ";
import { User } from "../models/User";
import NotificationService from "./NotificationService";
import { getSocketService } from "../config/socket";

export class SupportService {
  /**
   * Create a new support ticket
   */
  static async createTicket(data: {
    userId: string;
    subject: string;
    description: string;
    category: "technical" | "payment" | "task" | "account" | "other";
    priority?: "low" | "medium" | "high";
    attachments?: string[];
  }) {
    const ticket = await SupportTicket.create({
      userId: data.userId,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority || "medium",
      attachments: data.attachments,
      status: "open",
      responses: [],
    });

    // Notify user
    await NotificationService.sendToUser({
      userId: data.userId,
      title: "Support Ticket Created",
      body: `Your support ticket #${ticket._id
        .toString()
        .slice(0, 8)} has been created. We'll respond within 60 seconds.`,
      type: "support",
      data: { ticketId: ticket._id.toString() },
    });

    console.log(`New support ticket created: ${ticket._id}`);
    return ticket;
  }

  /**
   * Get user's support tickets
   */
  static async getUserTickets(userId: string, status?: string) {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "username email")
      .lean();

    return tickets;
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(ticketId: string, userId?: string) {
    const query: any = { _id: ticketId };
    if (userId) {
      query.userId = userId;
    }

    const ticket = await SupportTicket.findOne(query)
      .populate("userId", "username email")
      .populate("assignedTo", "username")
      .lean();

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
  }

  /**
   * Add response to ticket
   */
  static async addResponse(data: {
    ticketId: string;
    userId: string;
    message: string;
    isAdmin: boolean;
  }) {
    const ticket = await SupportTicket.findById(data.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Add response
    ticket.responses.push({
      userId: data.userId as any,
      message: data.message,
      isAdmin: data.isAdmin,
      createdAt: new Date(),
    });

    // Update status if admin is responding
    if (data.isAdmin && ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save();

    // Notify the other party
    const notifyUserId = data.isAdmin
      ? ticket.userId.toString()
      : ticket.assignedTo?.toString();

    if (notifyUserId) {
      await NotificationService.sendToUser({
        userId: notifyUserId,
        title: "New Support Response",
        body: `You have a new response on ticket #${ticket._id
          .toString()
          .slice(0, 8)}`,
        type: "support",
        data: { ticketId: ticket._id.toString() },
      });

      // Send real-time notification
      try {
        const socketService = getSocketService();
        socketService.emitNotification(notifyUserId, {
          type: "support_response",
          ticketId: ticket._id.toString(),
          message: data.message,
        });
      } catch (error) {
        console.error("Error sending socket notification:", error);
      }
    }

    return ticket;
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(
    ticketId: string,
    status: "open" | "in_progress" | "resolved" | "closed",
    adminId?: string
  ) {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.status = status;

    if (status === "resolved" || status === "closed") {
      ticket.resolvedAt = new Date();
    }

    if (adminId && !ticket.assignedTo) {
      ticket.assignedTo = adminId as any;
    }

    await ticket.save();

    // Notify user
    await NotificationService.sendToUser({
      userId: ticket.userId.toString(),
      title: "Ticket Status Updated",
      body: `Your support ticket #${ticket._id
        .toString()
        .slice(0, 8)} status has been updated to ${status}`,
      type: "support",
      data: { ticketId: ticket._id.toString(), status },
    });

    return ticket;
  }

  /**
   * Assign ticket to admin
   */
  static async assignTicket(ticketId: string, adminId: string) {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.assignedTo = adminId as any;

    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save();
    return ticket;
  }

  /**
   * Get all tickets (admin)
   */
  static async getAllTickets(filters: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.category) query.category = filters.category;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email")
        .populate("assignedTo", "username")
        .lean(),
      SupportTicket.countDocuments(query),
    ]);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get FAQs
   */
  static async getFAQs(category?: string, search?: string) {
    const query: any = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 }).lean();

    return faqs;
  }

  /**
   * Get FAQ by ID
   */
  static async getFAQById(faqId: string) {
    const faq = await FAQ.findById(faqId);

    if (!faq) {
      throw new Error("FAQ not found");
    }

    // Increment views
    faq.views += 1;
    await faq.save();

    return faq;
  }

  /**
   * Mark FAQ as helpful/not helpful
   */
  static async rateFAQ(faqId: string, helpful: boolean) {
    const faq = await FAQ.findById(faqId);

    if (!faq) {
      throw new Error("FAQ not found");
    }

    if (helpful) {
      faq.helpful += 1;
    } else {
      faq.notHelpful += 1;
    }

    await faq.save();
    return faq;
  }

  /**
   * Create FAQ (admin)
   */
  static async createFAQ(data: {
    question: string;
    answer: string;
    category: "general" | "tasks" | "payments" | "account" | "technical";
    order?: number;
    tags?: string[];
  }) {
    const faq = await FAQ.create({
      question: data.question,
      answer: data.answer,
      category: data.category,
      order: data.order || 0,
      tags: data.tags || [],
      isPublished: true,
    });

    return faq;
  }

  /**
   * Update FAQ (admin)
   */
  static async updateFAQ(
    faqId: string,
    data: Partial<{
      question: string;
      answer: string;
      category: string;
      order: number;
      tags: string[];
      isPublished: boolean;
    }>
  ) {
    const faq = await FAQ.findByIdAndUpdate(faqId, data, { new: true });

    if (!faq) {
      throw new Error("FAQ not found");
    }

    return faq;
  }

  /**
   * Delete FAQ (admin)
   */
  static async deleteFAQ(faqId: string) {
    const faq = await FAQ.findByIdAndDelete(faqId);

    if (!faq) {
      throw new Error("FAQ not found");
    }

    return { message: "FAQ deleted successfully" };
  }

  /**
   * Get support statistics (admin)
   */
  static async getSupportStatistics() {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    ] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: "open" }),
      SupportTicket.countDocuments({ status: "in_progress" }),
      SupportTicket.countDocuments({ status: "resolved" }),
      SupportTicket.countDocuments({ status: "closed" }),
    ]);

    const avgResponseTime = await this.calculateAverageResponseTime();

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      avgResponseTime,
    };
  }

  /**
   * Calculate average response time
   */
  private static async calculateAverageResponseTime(): Promise<number> {
    const tickets = await SupportTicket.find({
      status: { $in: ["resolved", "closed"] },
      resolvedAt: { $ne: null },
    }).select("createdAt resolvedAt");

    if (tickets.length === 0) return 0;

    const totalTime = tickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const resolved = new Date(ticket.resolvedAt!).getTime();
      return sum + (resolved - created);
    }, 0);

    // Return average in hours
    return totalTime / tickets.length / (1000 * 60 * 60);
  }
}
