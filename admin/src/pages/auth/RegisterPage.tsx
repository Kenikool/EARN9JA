import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Shield,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

type RegisterStep =
  | "form"
  | "otp-email"
  | "otp-phone"
  | "otp-verify"
  | "success";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, register, isLoading, error, clearError } =
    useAuthStore();

  const [currentStep, setCurrentStep] = useState<RegisterStep>("form");
  const [otpData, setOtpData] = useState({
    emailOTP: "",
    phoneOTP: "",
    selectedMethod: "email" as "email" | "phone",
  });

  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    roles: ["admin"],
    // Sponsor fields (optional)
    companyName: "",
    businessType: "",
    taxId: "",
    businessDescription: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber =
        "Phone number must be in international format (+2349012345678) or local format (09012345678)";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Validate names
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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

  const handleSendOTP = async (method: "email" | "phone") => {
    const identifier =
      method === "email" ? formData.email : formData.phoneNumber;

    try {
      await sendOTP({
        identifier,
        type: method,
        purpose: "registration",
      });

      toast.success(`OTP sent to your ${method}!`, {
        icon: "✨",
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });
      setCurrentStep(method === "email" ? "otp-email" : "otp-phone");
    } catch (error) {
      toast.error(`Failed to send OTP to ${method}`);
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpData.emailOTP || otpData.phoneOTP;
    const identifier =
      otpData.selectedMethod === "email"
        ? formData.email
        : formData.phoneNumber;

    try {
      await verifyOTP({
        identifier,
        code: otp,
        purpose: "registration",
      });

      setCurrentStep("otp-verify");
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      toast.success("Registration successful!", {
        icon: "🎉",
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });
      setCurrentStep("success");

      // App.tsx will handle the redirection automatically
      setTimeout(() => {
        // Dashboard redirect is handled by App.tsx protected routes
      }, 2000);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const renderFormStep = () => (
    <div className="relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">Join our admin panel and start managing</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                First Name
              </div>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your first name"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                validationErrors.firstName
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : focusedField === "firstName"
                  ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
              } focus:outline-none focus:ring-4 placeholder-gray-400`}
              required
            />
            {validationErrors.firstName && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Last Name
              </div>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("lastName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your last name"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                validationErrors.lastName
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : focusedField === "lastName"
                  ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
              } focus:outline-none focus:ring-4 placeholder-gray-400`}
              required
            />
            {validationErrors.lastName && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Email Address
              </div>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                validationErrors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : focusedField === "email"
                  ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
              } focus:outline-none focus:ring-4 placeholder-gray-400`}
              required
            />
            {validationErrors.email && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                Phone Number
              </div>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("phoneNumber")}
              onBlur={() => setFocusedField(null)}
              placeholder="+2349012345678 or 09012345678"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                validationErrors.phoneNumber
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : focusedField === "phoneNumber"
                  ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
              } focus:outline-none focus:ring-4 placeholder-gray-400`}
              required
            />
            {validationErrors.phoneNumber && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            {validationErrors.password && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                Confirm Password
              </div>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                  validationErrors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : focusedField === "confirmPassword"
                    ? "border-blue-500 focus:border-blue-600 focus:ring-blue-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                } focus:outline-none focus:ring-4 placeholder-gray-400`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Sponsor Information (Optional) */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Sponsor Information
            </h3>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-200 focus:outline-none focus:ring-4 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-200 focus:outline-none focus:ring-4 text-gray-900"
              >
                <option value="">Select business type</option>
                <option value="individual">Individual</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="corporation">Corporation</option>
                <option value="llc">LLC</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tax ID
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              placeholder="Enter tax ID"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-200 focus:outline-none focus:ring-4 placeholder-gray-400"
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Business Description
            </label>
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleInputChange}
              placeholder="Describe your business"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-200 focus:outline-none focus:ring-4 placeholder-gray-400 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* OTP Verification Buttons */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Verify Your Identity
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Choose at least one method to verify your account with OTP
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSendOTP("email")}
              disabled={
                !formData.email || !validateEmail(formData.email) || isLoading
              }
              className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-blue-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Mail className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
              <span className="font-medium text-blue-700">
                Send OTP to Email
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSendOTP("phone")}
              disabled={
                !formData.phoneNumber ||
                !validatePhoneNumber(formData.phoneNumber) ||
                isLoading
              }
              className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-green-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-green-400 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Phone className="h-5 w-5 text-green-600 group-hover:text-green-700" />
              <span className="font-medium text-green-700">
                Send OTP to Phone
              </span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Create Account
            </span>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );

  const renderOTPStep = (method: "email" | "phone") => (
    <div className="relative z-10 text-center">
      <div className="mb-8">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            method === "email"
              ? "bg-gradient-to-r from-blue-500 to-blue-600"
              : "bg-gradient-to-r from-green-500 to-green-600"
          }`}
        >
          {method === "email" ? (
            <Mail className="w-8 h-8 text-white" />
          ) : (
            <Phone className="w-8 h-8 text-white" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verify Your {method === "email" ? "Email" : "Phone"}
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to your{" "}
          {method === "email" ? "email address" : "phone number"}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Enter OTP Code
          </label>
          <input
            type="text"
            value={method === "email" ? otpData.emailOTP : otpData.phoneOTP}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtpData((prev) => ({
                ...prev,
                [method === "email" ? "emailOTP" : "phoneOTP"]: value,
              }));
            }}
            placeholder="Enter 6-digit OTP"
            className="w-full px-6 py-4 text-center text-2xl tracking-[0.5em] border-2 border-gray-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-200 focus:outline-none focus:ring-4 placeholder-gray-400"
            maxLength={6}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={
              (method === "email" ? otpData.emailOTP : otpData.phoneOTP)
                .length !== 6 || isLoading
            }
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Verify OTP
              </span>
            )}
          </button>

          <button
            onClick={() => handleSendOTP(method)}
            className="w-full py-3 px-4 rounded-xl font-medium text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            disabled={isLoading}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Resend OTP
            </span>
          </button>

          <button
            onClick={() => setCurrentStep("form")}
            className="w-full py-3 px-4 rounded-xl font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="relative z-10 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600">
          Welcome to Earn9ja Admin Panel. Redirecting to dashboard...
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Logo/Header Section */}
          <div className="text-center mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Earn9ja Admin
            </h1>
            <p className="text-gray-600 mt-2">Create your admin account</p>
          </div>

          {/* Main Registration Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 relative">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>

            {currentStep === "form" && renderFormStep()}
            {currentStep === "otp-email" && renderOTPStep("email")}
            {currentStep === "otp-phone" && renderOTPStep("phone")}
            {currentStep === "success" && renderSuccessStep()}
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

export default RegisterPage;
