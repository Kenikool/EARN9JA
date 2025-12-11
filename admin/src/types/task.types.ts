export interface Task {
  _id: string;
  sponsorId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  title: string;
  description: string;
  category: "social_media" | "music" | "survey" | "review" | "game" | "ads";
  platform: string;
  taskType: string;
  targetUrl?: string;
  reward: number;
  totalSlots: number;
  availableSlots: number;
  completedSlots: number;
  requirements: string[];
  proofRequirements: {
    type: "screenshot" | "link" | "video" | "text";
    description: string;
    required: boolean;
  }[];
  estimatedTime: number;
  expiresAt: Date;
  status:
    | "draft"
    | "pending_approval"
    | "active"
    | "paused"
    | "completed"
    | "expired"
    | "cancelled"
    | "rejected";
  metadata: {
    platformName?: string;
    taskTypeName?: string;
    icon?: string;
    color?: string;
  };
  imageUrls: string[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?:
    | "draft"
    | "pending_approval"
    | "active"
    | "paused"
    | "completed"
    | "expired"
    | "cancelled"
    | "rejected";
  category?: "social_media" | "music" | "survey" | "review" | "game" | "ads";
  search?: string;
}

export interface TaskSubmission {
  _id: string;
  taskId: string;
  workerId: string;
  proofData: {
    type: "screenshot" | "link" | "video" | "text";
    url?: string;
    content?: string;
  }[];
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}
