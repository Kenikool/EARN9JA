import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import type {
  PlatformStats,
  User,
  Task,
  Withdrawal,
  Dispute,
} from "../services/adminService";

// Query Keys
export const queryKeys = {
  platformStats: ["admin", "platform-stats"] as const,
  users: (filters: Record<string, unknown>) =>
    ["admin", "users", filters] as const,
  userDetails: (userId: string) => ["admin", "users", userId] as const,
  pendingTasks: (page: number, limit: number) =>
    ["admin", "tasks", "pending", page, limit] as const,
  pendingWithdrawals: (page: number, limit: number) =>
    ["admin", "withdrawals", "pending", page, limit] as const,
  pendingDisputes: (page: number, limit: number) =>
    ["admin", "disputes", "pending", page, limit] as const,
  disputeDetails: (disputeId: string) =>
    ["admin", "disputes", disputeId] as const,
  revenueReport: (startDate: string, endDate: string) =>
    ["admin", "revenue", startDate, endDate] as const,
};

// Platform Statistics Hook
export const usePlatformStats = () => {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: () => adminService.getPlatformStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Users Hook
export const useUsers = (
  filters: {
    status?: string;
    role?: string;
    isKYCVerified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => adminService.getAllUsers(filters),
    placeholderData: (previousData) => previousData,
  });
};

// User Details Hook
export const useUserDetails = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userDetails(userId),
    queryFn: () => adminService.getUserDetails(userId),
    enabled: !!userId,
  });
};

// Pending Tasks Hook
export const usePendingTasks = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.pendingTasks(page, limit),
    queryFn: () => adminService.getPendingTasks(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

// Pending Withdrawals Hook
export const usePendingWithdrawals = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.pendingWithdrawals(page, limit),
    queryFn: () => adminService.getPendingWithdrawals(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

// Pending Disputes Hook
export const usePendingDisputes = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.pendingDisputes(page, limit),
    queryFn: () => adminService.getPendingDisputes(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

// Dispute Details Hook
export const useDisputeDetails = (disputeId: string) => {
  return useQuery({
    queryKey: queryKeys.disputeDetails(disputeId),
    queryFn: () => adminService.getDisputeDetails(disputeId),
    enabled: !!disputeId,
  });
};

// Revenue Report Hook
export const useRevenueReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: queryKeys.revenueReport(startDate, endDate),
    queryFn: () => adminService.getRevenueReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

// Mutation Hooks
export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => adminService.approveTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.platformStats });
    },
  });
};

export const useRejectTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      adminService.rejectTask(taskId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
    },
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (withdrawalId: string) =>
      adminService.approveWithdrawal(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.platformStats });
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      withdrawalId,
      reason,
    }: {
      withdrawalId: string;
      reason: string;
    }) => adminService.rejectWithdrawal(withdrawalId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
    },
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disputeId,
      resolution,
    }: {
      disputeId: string;
      resolution: {
        decision: string;
        action: "refund_worker" | "refund_sponsor" | "no_action" | "ban_user";
        notes: string;
      };
    }) => adminService.resolveDispute(disputeId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });
};

export const useUpdateDisputeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disputeId,
      status,
    }: {
      disputeId: string;
      status: "under_review" | "rejected";
    }) => adminService.updateDisputeStatus(disputeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });
};
