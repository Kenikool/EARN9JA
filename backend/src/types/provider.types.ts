export enum ProviderType {
  API = "api",
  OFFER_WALL = "offer_wall",
  CONTENT_LOCKER = "content_locker",
}

export enum TaskCategory {
  SURVEY = "survey",
  SOCIAL_MEDIA = "social_media",
  GAME = "game",
  VIDEO = "video",
  MICRO_TASK = "micro_task",
  APP_TESTING = "app_testing",
}

export interface TaskFilters {
  category?: TaskCategory;
  minReward?: number;
  maxTime?: number;
  limit?: number;
}

export interface TaskRequirements {
  minAge?: number;
  countries?: string[];
  demographics?: Record<string, any>;
  deviceType?: "mobile" | "desktop" | "both";
}

export interface ExternalTask {
  externalId: string;
  providerId: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: {
    amount: number;
    currency: string;
  };
  requirements: TaskRequirements;
  estimatedTime: number;
  proofType: "screenshot" | "link" | "text" | "automatic";
  expiresAt?: Date;
}

export interface TaskProof {
  userId: string;
  taskId: string;
  proofData: any;
  completionCode?: string;
}

export interface SubmissionResult {
  success: boolean;
  reward?: number;
  message: string;
}

export enum TaskStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface PayoutStatus {
  status: "pending" | "processing" | "completed" | "failed";
  amount?: number;
  estimatedDate?: Date;
}

export interface HealthStatus {
  providerId: string;
  status: "healthy" | "degraded" | "unhealthy" | "stale";
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  lastSync?: Date;
  issues: string[];
}

export interface IProviderAdapter {
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  category: TaskCategory;
  commissionRate: number;

  authenticate(): Promise<boolean>;
  refreshToken(): Promise<void>;
  fetchTasks(filters?: TaskFilters): Promise<ExternalTask[]>;
  getTaskDetails(externalTaskId: string): Promise<ExternalTask>;
  submitCompletion(taskId: string, proof: TaskProof): Promise<SubmissionResult>;
  checkTaskStatus(taskId: string): Promise<TaskStatus>;
  checkPayoutStatus(taskId: string): Promise<PayoutStatus>;
  getProviderHealth(): Promise<HealthStatus>;
}
