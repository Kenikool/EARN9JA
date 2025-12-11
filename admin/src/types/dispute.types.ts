export interface Dispute {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    category: string;
    reward: number;
  };
  submissionId: string;
  reportedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  reportedAgainst: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  type: "task_not_completed" | "payment_issue" | "fraud" | "other";
  description: string;
  evidence: {
    type: "image" | "video" | "link" | "text";
    url?: string;
    content?: string;
  }[];
  status: "pending" | "under_review" | "resolved" | "rejected";
  resolution?: {
    decision: string;
    action: "refund_worker" | "refund_sponsor" | "no_action" | "ban_user";
    resolvedBy: string;
    resolvedAt: Date;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "under_review" | "resolved" | "rejected";
  type?: "task_not_completed" | "payment_issue" | "fraud" | "other";
}
