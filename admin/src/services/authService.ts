import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.earn9ja.site/api/v1";

console.log("🔗 Admin API URL:", API_BASE_URL);

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

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          if (response.success && response.token) {
            authService.setTokens(response.token, response.refreshToken!);
            originalRequest.headers.Authorization = `Bearer ${response.token}`;
            return api(originalRequest);
          }
        } catch {
          authService.clearTokens();
          authService.clearStoredUser();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
