import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phoneNumber ||
        !formData.password
      ) {
        throw new Error("All fields are required");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      await api.post("/auth/register/send-otp", {
        identifier: formData.email,
        type: "email",
        purpose: "registration",
      });

      toast.success("OTP sent to your email!");
      setSuccess("OTP sent to your email!");
      setStep("otp");
    } catch (err: unknown) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to send OTP";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      await api.post("/auth/register/verify", {
        identifier: formData.email,
        code: otp,
        purpose: "registration",
      });

      await api.post("/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        roles: ["admin"],
      });

      toast.success("Admin account created successfully!");
      setSuccess("Admin account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Registration failed";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register/send-otp", {
        identifier: formData.email,
        type: "email",
        purpose: "registration",
      });

      toast.success("OTP resent to your email!");
      setSuccess("OTP resent to your email!");
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to resend OTP";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Register Card */}
        <div className="bg-gradient-to-b from-blue-400/90 to-green-400/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
          {step === "form" ? (
            <>
              {/* User Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <UserPlus className="w-10 h-10 text-gray-700" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                CREATE ACCOUNT
              </h1>
              <p className="text-white/80 text-center mb-6 text-sm">
                Register as Earn9ja Admin
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg text-white text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-300/30 rounded-lg text-white text-sm text-center">
                  {success}
                </div>
              )}

              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-white font-medium mb-2 text-sm"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-white/95 border-0 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm text-sm"
                        placeholder="First Name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-white font-medium mb-2 text-sm"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-white/95 border-0 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm text-sm"
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-white font-medium mb-2 text-sm"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-white/95 border-0 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm text-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-white font-medium mb-2 text-sm"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-white/95 border-0 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm text-sm"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-white font-medium mb-2 text-sm"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-11 py-3 bg-white/95 border-0 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm text-sm"
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-white font-medium mb-2 text-sm"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-11 py-3 bg-white/95 border-0 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm text-sm"
                      placeholder="Re-enter password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>Continue</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/30"></div>
                  <span className="text-white/70 text-xs font-medium">OR</span>
                  <div className="flex-1 h-px bg-white/30"></div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-white/90 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-white hover:underline transition-all"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Check Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                VERIFY EMAIL
              </h1>
              <p className="text-white/80 text-center mb-6 text-sm">
                Enter the 6-digit code sent to
                <br />
                <span className="font-semibold">{formData.email}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg text-white text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-300/30 rounded-lg text-white text-sm text-center">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    className="w-full px-4 py-4 bg-white/95 border-0 rounded-lg text-gray-800 text-center text-3xl tracking-[0.5em] font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify & Register</span>
                    </>
                  )}
                </button>

                {/* Resend Button */}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full py-3 bg-transparent text-white/90 font-medium rounded-lg hover:bg-white/10 focus:outline-none transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to form</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-xs">
            © 2024 Earn9ja. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
