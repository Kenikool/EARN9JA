import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.earn9ja.site/api/v1";

console.log("=".repeat(50));
console.log("🔗 Admin API URL:", API_BASE_URL);
console.log("🔗 VITE_API_URL env:", import.meta.env.VITE_API_URL);
console.log("=".repeat(50));

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  companyName?: string;
  businessType?: string;
  taxId?: string;
  businessDescription?: string;
}

export interface OTPRequest {
  identifier: string;
  type: "email" | "phone";
  purpose: "registration" | "login" | "password_reset" | "withdrawal";
}

export interface OTPVerification {
  identifier: string;
  code: string;
  purpose: "registration" | "login" | "password_reset" | "withdrawal";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  user?: unknown;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

// Auth Service
export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Send OTP
  async sendOTP(request: OTPRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/register/send-otp", request);
    return response.data;
  },

  // Verify OTP
  async verifyOTP(verification: OTPVerification): Promise<AuthResponse> {
    const response = await api.post("/auth/register/verify", verification);
    return response.data;
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Resend OTP
  async resendOTP(request: OTPRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/resend-otp", request);
    return response.data;
  },

  // Forgot Password
  async sendPasswordResetOTP(request: OTPRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/forgot-password/send-otp", request);
    return response.data;
  },

  // Reset Password
  async resetPassword(
    identifier: string,
    newPassword: string
  ): Promise<AuthResponse> {
    const response = await api.post("/auth/forgot-password/reset", {
      identifier,
      newPassword,
    });
    return response.data;
  },

  // Logout
  async logout(): Promise<AuthResponse> {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  // Get current token
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  // Store tokens
  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  },

  // Clear tokens
  clearTokens(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },

  // Get stored user data
  getStoredUser(): unknown {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  // Store user data
  setStoredUser(user: unknown): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear user data
  clearStoredUser(): void {
    localStorage.removeItem("user");
  },
};

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's the refresh token endpoint itself or already retried
    if (
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest._retry
    ) {
      if (error.response?.status === 401) {
        authService.clearTokens();
        authService.clearStoredUser();
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          console.log("🔄 Attempting to refresh token...");
          const response = await authService.refreshToken(refreshToken);
          console.log("🔄 Refresh response:", response);

          const newToken = response.accessToken || response.token;
          if (response.success && newToken) {
            console.log("✅ Token refreshed successfully");
            // Keep the existing refresh token if backend doesn't return a new one
            const newRefreshToken = response.refreshToken || refreshToken;
            authService.setTokens(newToken, newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            isRefreshing = false;
            return api(originalRequest);
          } else {
            console.error("❌ Token refresh failed - no token in response");
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          console.error("❌ Token refresh error:", refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;
          authService.clearTokens();
          authService.clearStoredUser();
          return Promise.reject(refreshError);
        }
      } else {
        console.error("❌ No refresh token available");
        processQueue(new Error("No refresh token"), null);
        isRefreshing = false;
        authService.clearTokens();
        authService.clearStoredUser();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
