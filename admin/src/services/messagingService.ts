import api from "./authService";

export interface BulkMessage {
  _id: string;
  title: string;
  body: string;
  type: "in_app" | "push" | "both";
  targetAudience: {
    type: "all" | "filtered" | "segment";
    filters?: {
      status?: string[];
      roles?: string[];
      kycVerified?: boolean;
      registeredAfter?: string;
      registeredBefore?: string;
    };
    segmentId?: string;
  };
  scheduledFor?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  delivery: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  };
  createdBy: any;
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
}

export interface MessageTemplate {
  _id: string;
  name: string;
  title: string;
  body: string;
  variables: string[];
  targetAudience?: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkMessageInput {
  title: string;
  body: string;
  type: "in_app" | "push" | "both";
  targetAudience: {
    type: "all" | "filtered" | "segment";
    filters?: {
      status?: string[];
      roles?: string[];
      kycVerified?: boolean;
      registeredAfter?: string;
      registeredBefore?: string;
    };
  };
  scheduledFor?: string;
}

export const messagingService = {
  // Messages
  async createMessage(
    data: BulkMessageInput
  ): Promise<{ success: boolean; data: { messageId: string } }> {
    const response = await api.post("/admin/messages", data);
    return response.data;
  },

  async sendMessage(
    messageId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/messages/${messageId}/send`);
    return response.data;
  },

  async scheduleMessage(
    messageId: string,
    scheduledFor: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/messages/${messageId}/schedule`, {
      scheduledFor,
    });
    return response.data;
  },

  async cancelMessage(
    messageId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/messages/${messageId}`);
    return response.data;
  },

  async getMessageStatus(
    messageId: string
  ): Promise<{ success: boolean; data: BulkMessage }> {
    const response = await api.get(`/admin/messages/${messageId}/status`);
    return response.data;
  },

  async getMessages(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{
    success: boolean;
    data: BulkMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }
    const response = await api.get(`/admin/messages?${params}`);
    return response.data;
  },

  // Templates
  async createTemplate(data: {
    name: string;
    title: string;
    body: string;
    variables: string[];
    targetAudience?: any;
  }): Promise<{ success: boolean; data: { templateId: string } }> {
    const response = await api.post("/admin/templates", data);
    return response.data;
  },

  async getTemplates(): Promise<{ success: boolean; data: MessageTemplate[] }> {
    const response = await api.get("/admin/templates");
    return response.data;
  },

  async updateTemplate(
    templateId: string,
    data: Partial<MessageTemplate>
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/admin/templates/${templateId}`, data);
    return response.data;
  },

  async deleteTemplate(
    templateId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/templates/${templateId}`);
    return response.data;
  },
};

export default messagingService;
