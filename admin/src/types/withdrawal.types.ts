export interface Withdrawal {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
    phoneNumber: string;
  };
  amount: number;
  method: "bank_transfer" | "opay" | "palmpay";
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    phoneNumber?: string;
  };
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  fee: number;
  netAmount: number;
  reference: string;
  processedAt?: Date;
  failureReason?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
  method?: "bank_transfer" | "opay" | "palmpay";
  search?: string;
}
