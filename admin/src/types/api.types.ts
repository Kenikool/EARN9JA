export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PlatformStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
  };
  tasks: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  financials: {
    totalRevenue: number;
    totalPayouts: number;
    pendingWithdrawals: number;
    escrowBalance: number;
  };
}

export interface KYCSubmission {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  verificationType: "nin" | "bvn" | "drivers_license" | "voters_card";
  identityNumber: string;
  verificationData: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    phoneNumber: string;
  };
  documents: {
    idCard?: string;
    selfie?: string;
    proofOfAddress?: string;
  };
  status: "pending" | "approved" | "rejected" | "resubmit";
  rejectionReason?: string;
  submittedAt: Date;
  verifiedAt?: Date;
}

export interface SupportTicket {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  subject: string;
  description: string;
  category: "technical" | "payment" | "task" | "account" | "other";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  conversation: {
    message: string;
    sender: "user" | "admin";
    sentAt: Date;
  }[];
  attachments?: string[];
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ActivityLog {
  _id: string;
  adminId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  action: string;
  entityType:
    | "user"
    | "task"
    | "withdrawal"
    | "dispute"
    | "kyc"
    | "support"
    | "settings";
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalPayouts: number;
  netRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
}

export interface AdMobAnalytics {
  totalAdsWatched: number;
  uniqueUsers: number;
  totalRevenue: number;
  platformBreakdown: {
    ios: {
      adsWatched: number;
      revenue: number;
    };
    android: {
      adsWatched: number;
      revenue: number;
    };
  };
  topEarningUsers: {
    userId: string;
    userName: string;
    adsWatched: number;
    revenue: number;
  }[];
  averageAdsPerUser: number;
  averageRevenuePerUser: number;
}
