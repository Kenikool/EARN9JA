import api from "./api";
import type { ApiResponse } from "@/types/api.types";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    roles: string[];
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/auth/register",
      data
    );
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPRequest) => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/auth/verify-otp",
      data
    );
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/auth/resend-otp",
      { email }
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/auth/logout"
    );
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse<{ token: string }>>(
      "/auth/refresh-token"
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<LoginResponse["user"]>>(
      "/auth/me"
    );
    return response.data;
  },
};
