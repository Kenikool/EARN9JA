import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/api";
import { storage } from "../../utils/storage";

export default function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      const user = data.data.user;
      
      // Check if user is admin
      if (user.role !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      // Store tokens and user data
      storage.setAccessToken(data.data.accessToken);
      storage.setRefreshToken(data.data.refreshToken);
      storage.setUser(user);
      queryClient.setQueryData(['user'], user);
      
      // Dismiss any previous toasts before showing success
      toast.dismiss();
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data before submitting
    if (!formData.email || !formData.password) {
      toast.error("Please provide email and password");
      return;
    }
    
    // Trim whitespace
    const cleanedData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };
    
    loginMutation.mutate(cleanedData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="text-base-content/60 mt-2">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
                  <Mail className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
                  <Lock className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  style={{ zIndex: 10 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="divider">OR</div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-base-content/60">
              Don't have an admin account?{" "}
              <Link to="/admin/register" className="link link-primary">
                Register here
              </Link>
            </p>
            <p className="text-sm text-base-content/60">
              <Link to="/" className="link link-primary">
                Back to Store
              </Link>
            </p>
          </div>

          {/* Warning */}
          <div className="alert alert-warning mt-4">
            <Shield className="w-5 h-5" />
            <span className="text-sm">
              This area is restricted to administrators only.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
