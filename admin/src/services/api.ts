import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - logout user
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      useAuthStore.getState().logout();
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error("You don't have permission to perform this action.");
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error("Resource not found.");
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error("Server error. Please try again later.");
    }

    // Handle network errors
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

// Retry logic for failed requests
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retryCount?: number;
    };

    if (!config || !config._retryCount) {
      config._retryCount = 0;
    }

    // Retry up to 2 times for network errors or 5xx errors
    if (
      config &&
      config._retryCount !== undefined &&
      config._retryCount < 2 &&
      (!error.response ||
        (error.response.status >= 500 && error.response.status < 600))
    ) {
      config._retryCount += 1;

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config._retryCount!)
      );

      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
