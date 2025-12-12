import api from "./authService";

// Types
export interface PlatformStats {
  users: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    active: number;
    completed: number;
  };
  financials: {
    totalRevenue: number;
    totalPayouts: number;
    pendingWithdrawals: number;
  };
}

export interface User {
  _id: string;
  email: string;
  phoneNumber: string;
  status: string;
  roles: string[];
  isKYCVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
  };
  walletId?: {
    availableBalance: number;
    lifetimeEarnings: number;
  };
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  status: string;
  moderationStatus: string;
  sponsorId: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  userId: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
}

export interface Dispute {
  _id: string;
  title: string;
  description: string;
  status: string;
  reportedBy: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  taskId?: {
    title: string;
    category: string;
    reward: number;
  };
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsersPaginatedResponse {
  users: User[];
  pagination: Pagination;
}

export interface TasksPaginatedResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface WithdrawalsPaginatedResponse {
  withdrawals: Withdrawal[];
  pagination: Pagination;
}

export interface DisputesPaginatedResponse {
  disputes: Dispute[];
  pagination: Pagination;
}

// Admin API Service
export const adminService = {
  // Platform Statistics
  async getPlatformStats(): Promise<{ success: boolean; data: PlatformStats }> {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  // User Management
  async getAllUsers(
    filters: {
      status?: string;
      role?: string;
      isKYCVerified?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ success: boolean; data: UsersPaginatedResponse }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  async getUserDetails(
    userId: string
  ): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async suspendUser(
    userId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/users/${userId}/suspend`, {
      reason,
    });
    return response.data;
  },

  async banUser(
    userId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  async reactivateUser(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/users/${userId}/reactivate`);
    return response.data;
  },

  // Task Management
  async getPendingTasks(
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: TasksPaginatedResponse }> {
    const response = await api.get(
      `/admin/tasks/pending?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async approveTask(
    taskId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/tasks/${taskId}/approve`);
    return response.data;
  },

  async rejectTask(
    taskId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/tasks/${taskId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Withdrawal Management
  async getPendingWithdrawals(
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: WithdrawalsPaginatedResponse }> {
    const response = await api.get(
      `/admin/withdrawals/pending?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async approveWithdrawal(
    withdrawalId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(
      `/admin/withdrawals/${withdrawalId}/approve`
    );
    return response.data;
  },

  async rejectWithdrawal(
    withdrawalId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(
      `/admin/withdrawals/${withdrawalId}/reject`,
      { reason }
    );
    return response.data;
  },

  // Dispute Management
  async getPendingDisputes(
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: DisputesPaginatedResponse }> {
    const response = await api.get(
      `/admin/disputes/pending?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getDisputeDetails(
    disputeId: string
  ): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/admin/disputes/${disputeId}`);
    return response.data;
  },

  async resolveDispute(
    disputeId: string,
    resolution: {
      decision: string;
      action: "refund_worker" | "refund_sponsor" | "no_action" | "ban_user";
      notes: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(
      `/admin/disputes/${disputeId}/resolve`,
      resolution
    );
    return response.data;
  },

  async updateDisputeStatus(
    disputeId: string,
    status: "under_review" | "rejected"
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/admin/disputes/${disputeId}/status`, {
      status,
    });
    return response.data;
  },

  // Revenue Report
  async getRevenueReport(
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; data: unknown }> {
    const response = await api.get(
      `/admin/revenue-report?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },
};

export default adminService;
