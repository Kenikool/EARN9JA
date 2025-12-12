import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+?[1-9]\d{1,14}|0\d{10})$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate identifier (email or phone)
    if (!formData.identifier.trim()) {
      errors.identifier = "Email or phone number is required";
    } else if (
      !validateEmail(formData.identifier) &&
      !validatePhoneNumber(formData.identifier)
    ) {
      errors.identifier = "Please enter a valid email or phone number";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 8 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear global error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      toast.success("Login successful!", {
        icon: "✨",
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });
    } catch (error) {
      // Error is handled by the store
      if (error) {
        toast.error("Login failed. Please check your credentials.");
      }
    }
  };

  const isIdentifierEmail = formData.identifier.includes("@");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo/Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Earn9ja Admin
            </h1>
            <p className="text-gray-600 mt-2">Welcome back to your dashboard</p>
          </div>

          {/* Main Login Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 relative">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600">
                  Enter your credentials to access the admin panel
                </p>
              </div>

              {/* Global Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-shake">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identifier Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      {isIdentifierEmail ? "Email Address" : "Phone Number"}
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("identifier")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={
                        isIdentifierEmail
                          ? "Enter your email"
                          : "Enter your phone number"
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                        validationErrors.identifier
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : focusedField === "identifier"
                          ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      } focus:outline-none focus:ring-4 placeholder-gray-400`}
                      required
                    />
                    {/* Floating label effect */}
                    {formData.identifier && (
                      <div className="absolute -top-2 left-3 px-1 bg-white text-xs text-blue-600 font-medium">
                        {isIdentifierEmail ? "Email" : "Phone"}
                      </div>
                    )}
                  </div>
                  {validationErrors.identifier && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.identifier}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                        validationErrors.password
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : focusedField === "password"
                          ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      } focus:outline-none focus:ring-4 placeholder-gray-400`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    {/* Floating label effect */}
                    {formData.password && (
                      <div className="absolute -top-2 left-3 px-1 bg-white text-xs text-blue-600 font-medium">
                        Password
                      </div>
                    )}
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Sign In
                    </span>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 Earn9ja Admin Panel. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
