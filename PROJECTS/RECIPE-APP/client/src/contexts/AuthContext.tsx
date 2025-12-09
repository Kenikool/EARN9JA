import React, { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    updateUser,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;

      if (currentToken && !currentUser) {
        try {
          setLoading(true);
          const response = await authAPI.getMe();
          storeLogin(response.data.data.user, currentToken);
        } catch (error) {
          console.error("Auth check failed:", error);
          storeLogout();
          // Clear all cached queries on auth failure
          queryClient.clear();
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      const response = await authAPI.login({ email, password });
      const user = response.data.data.user;
      const token = response.data.token;

      console.log(
        "🔐 Login response - User:",
        user?.email,
        "Token:",
        token ? "EXISTS" : "MISSING"
      );

      storeLogin(user, token);
      // Invalidate all queries to refetch with new auth
      await queryClient.invalidateQueries();
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      const response = await authAPI.register({ name, email, password });
      const user = response.data.data.user;
      const token = response.data.token;

      console.log(
        "🔐 Register response - User:",
        user?.email,
        "Token:",
        token ? "EXISTS" : "MISSING"
      );

      storeLogin(user, token);
      // Invalidate all queries to refetch with new auth
      await queryClient.invalidateQueries();
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      storeLogout();
      // Clear all cached queries on logout
      queryClient.clear();
    }
  };

  const updateProfile = async (data: unknown) => {
    try {
      setLoading(true);
      clearError();

      const response = await authAPI.updateProfile(data);
      updateUser(response.data.data.user);
      // Invalidate user-related queries
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error: unknown) {
      const message = error.response?.data?.message || "Profile update failed";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
