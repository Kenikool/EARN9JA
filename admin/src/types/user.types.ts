export interface User {
  _id: string;
  email: string;
  phoneNumber: string;
  roles: ("service_worker" | "sponsor" | "admin")[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: string;
    location?: {
      state: string;
      city: string;
    };
    language: string;
  };
  reputation: {
    score: number;
    level: number;
    totalTasksCompleted: number;
    approvalRate: number;
    averageCompletionTime?: number;
    badges: string[];
    ratings: {
      average: number;
      count: number;
    };
  };
  walletId?: {
    _id: string;
    availableBalance: number;
    lifetimeEarnings: number;
    lifetimeSpending: number;
  };
  isKYCVerified: boolean;
  status: "active" | "suspended" | "banned" | "pending_verification";
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  status?: "active" | "suspended" | "banned" | "pending_verification";
  role?: "service_worker" | "sponsor" | "admin";
  isKYCVerified?: boolean;
  search?: string;
}
