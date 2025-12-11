import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout: clearAuth,
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { token, user } = response.data;

        // Check if user has admin role
        if (!user.roles.includes("admin")) {
          toast.error("Access denied. Admin privileges required.");
          return;
        }

        setToken(token);
        setUser(user);
        toast.success("Login successful!");
        navigate("/");
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Login failed. Please try again.";
      toast.error(message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(
          response.message ||
            "Registration successful! Please verify your email."
        );
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Registration failed. Please try again.";
      toast.error(message);
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Email verified successfully!");
        navigate("/login");
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "OTP verification failed.";
      toast.error(message);
    },
  });

  // Resend OTP mutation
  const resendOTPMutation = useMutation({
    mutationFn: authService.resendOTP,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "OTP sent successfully!");
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to resend OTP.";
      toast.error(message);
    },
  });

  // Get current user query
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: !!token && isAuthenticated,
    retry: false,
  });

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  // Check if user is admin
  const isAdmin = user?.roles.includes("admin") || false;

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    verifyOTPLoading: verifyOTPMutation.isPending,
    resendOTP: resendOTPMutation.mutate,
    resendOTPLoading: resendOTPMutation.isPending,
    logout,
    refetchUser,
    currentUser,
  };
};
