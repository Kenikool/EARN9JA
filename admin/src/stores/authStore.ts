import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LoginCredentials,
  RegisterData,
  OTPRequest,
  OTPVerification,
} from "../services/authService";
import { authService } from "../services/authService";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  sendOTP: (request: OTPRequest) => Promise<void>;
  verifyOTP: (verification: OTPVerification) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);

          if (response.success && response.token && response.user) {
            authService.setTokens(response.token, response.refreshToken!);
            authService.setStoredUser(response.user);

            set({
              user: response.user as User,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            const errorMessage = response.message || "Login failed";
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw new Error(errorMessage);
          }
        } catch (error: unknown) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "An error occurred during login";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);

          if (response.success && response.user) {
            authService.setStoredUser(response.user);

            set({
              user: response.user as User,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.message || "Registration failed",
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "An error occurred during registration",
          });
        }
      },

      sendOTP: async (request: OTPRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.sendOTP(request);

          if (!response.success) {
            set({
              isLoading: false,
              error: response.message || "Failed to send OTP",
            });
          } else {
            set({
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to send OTP",
          });
        }
      },

      verifyOTP: async (verification: OTPVerification) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyOTP(verification);

          if (!response.success) {
            set({
              isLoading: false,
              error: response.message || "Invalid OTP",
            });
          } else {
            set({
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to verify OTP",
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          authService.clearTokens();
          authService.clearStoredUser();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state on app load
const initializeAuth = () => {
  const storedUser = authService.getStoredUser();
  const isAuthenticated = authService.isAuthenticated();

  if (storedUser && isAuthenticated) {
    useAuthStore.getState().setUser(storedUser as User);
  }
};

// Call initialization
initializeAuth();

export default useAuthStore;
