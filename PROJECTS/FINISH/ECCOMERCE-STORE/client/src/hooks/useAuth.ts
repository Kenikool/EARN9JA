import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { storage } from '../utils/storage';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

// Auth API calls
const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', userData);
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },

  logout: async (): Promise<void> => {
    // Optional: call backend logout endpoint if you have one
    // await api.post('/auth/logout');
  },
};

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Get current user
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getMe,
    enabled: !!storage.getAccessToken(),
    retry: false,
    staleTime: 0, // Always consider data stale to refetch when needed
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Check if 2FA is required
      if (data.requires2FA) {
        navigate('/2fa-verify', {
          state: {
            userId: data.userId,
            twoFactorMethod: data.twoFactorMethod,
          },
        });
        return;
      }

      // Normal login flow
      storage.setAccessToken(data.accessToken);
      storage.setRefreshToken(data.refreshToken);
      storage.setUser(data.user);
      
      // Set user data immediately and refetch to ensure UI updates
      queryClient.setQueryData(['user'], data.user);
      
      // Refetch user data to ensure everything is in sync
      refetch();
      
      // Also invalidate and refetch cart to fetch user's cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.refetchQueries({ queryKey: ['cart'] });
      
      toast.success('Login successful!');
      navigate('/shop');
    },
    onError: (error: unknown) => {
      const err = error as { 
        response?: { 
          status?: number;
          data?: { 
            message?: string;
            data?: {
              locked?: boolean;
              remainingMinutes?: number;
              attemptsRemaining?: number;
            };
          };
        };
      };
      
      // Handle account lockout (423 status)
      if (err.response?.status === 423) {
        const remainingMinutes = err.response.data?.data?.remainingMinutes || 0;
        toast.error(
          `Account locked due to multiple failed attempts. Try again in ${remainingMinutes} minutes.`,
          { duration: 5000 }
        );
        return;
      }
      
      // Show attempts remaining if available
      const attemptsRemaining = err.response?.data?.data?.attemptsRemaining;
      if (attemptsRemaining !== undefined && attemptsRemaining > 0) {
        toast.error(
          `${err.response?.data?.message || 'Login failed'}. ${attemptsRemaining} attempts remaining.`,
          { duration: 4000 }
        );
        return;
      }
      
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Don't auto-login, redirect to verification page
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/verify-email-sent', { state: { email: data.user.email } });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      storage.clearAll();
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      toast.success('Logged out successfully');

      // Sign out from Clerk if available and force redirect
      if (signOut) {
        await signOut({ redirectUrl: window.location.origin + '/login' });
      } else {
        window.location.href = '/login';
      }
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
