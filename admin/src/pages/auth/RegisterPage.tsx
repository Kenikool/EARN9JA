import React, { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";

// Zod validation schema
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phoneNumber: z
      .string()
      .min(11, "Phone number must be 11 digits")
      .max(11, "Phone number must be 11 digits")
      .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register, registerLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data with Zod
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      // Extract errors from Zod validation
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Clear all errors
    setErrors({});

    // Call register mutation
    register(
      {
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
      {
        onSuccess: () => {
          setShowOTPModal(true);
        },
      }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Earn9ja Admin
                  </span>
                </h1>
                <h2 className="text-2xl font-bold mb-2">Admin Registration</h2>
                <p className="text-sm text-base-content text-opacity-70">
                  Create your admin account for Earn9ja
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">First Name</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-base-content text-opacity-40" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className={`input input-bordered w-full pl-10 ${
                          errors.firstName ? "input-error" : ""
                        }`}
                        disabled={registerLoading}
                        autoComplete="given-name"
                      />
                    </div>
                    {errors.firstName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.firstName}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Last Name</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-base-content text-opacity-40" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className={`input input-bordered w-full pl-10 ${
                          errors.lastName ? "input-error" : ""
                        }`}
                        disabled={registerLoading}
                        autoComplete="family-name"
                      />
                    </div>
                    {errors.lastName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.lastName}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Email Address
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-base-content text-opacity-40" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@earn9ja.site"
                      className={`input input-bordered w-full pl-10 ${
                        errors.email ? "input-error" : ""
                      }`}
                      disabled={registerLoading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.email}
                      </span>
                    </label>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Phone Number</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-base-content text-opacity-40" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="08012345678"
                      className={`input input-bordered w-full pl-10 ${
                        errors.phoneNumber ? "input-error" : ""
                      }`}
                      disabled={registerLoading}
                      autoComplete="tel"
                      maxLength={11}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.phoneNumber}
                      </span>
                    </label>
                  )}
                </div>

                {/* Password Fields - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-base-content text-opacity-40" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className={`input input-bordered w-full pl-10 pr-10 ${
                          errors.password ? "input-error" : ""
                        }`}
                        disabled={registerLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-base-content text-opacity-40 hover:text-opacity-60" />
                        ) : (
                          <Eye className="h-5 w-5 text-base-content text-opacity-40 hover:text-opacity-60" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.password}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">
                        Confirm Password
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-base-content text-opacity-40" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`input input-bordered w-full pl-10 pr-10 ${
                          errors.confirmPassword ? "input-error" : ""
                        }`}
                        disabled={registerLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-base-content text-opacity-40 hover:text-opacity-60" />
                        ) : (
                          <Eye className="h-5 w-5 text-base-content text-opacity-40 hover:text-opacity-60" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.confirmPassword}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Links */}
              <div className="divider text-xs">OR</div>
              <div className="text-center">
                <p className="text-sm text-base-content text-opacity-70">
                  Already have an account?{" "}
                  <Link to="/login" className="link link-primary font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPVerificationModal
          email={formData.email}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </>
  );
};

// OTP Verification Modal Component
const OTPVerificationModal: React.FC<{
  email: string;
  onClose: () => void;
}> = ({ email, onClose }) => {
  const { verifyOTP, verifyOTPLoading, resendOTP, resendOTPLoading } =
    useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    verifyOTP({ email, otp });
  };

  const handleResendOTP = () => {
    resendOTP(email);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Verify Your Email</h3>
        <p className="text-sm mb-4">
          We've sent a 6-digit verification code to <strong>{email}</strong>.
          Please enter it below.
        </p>

        <form onSubmit={handleVerifyOTP}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Verification Code</span>
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="Enter 6-digit code"
              className={`input input-bordered w-full text-center text-2xl tracking-widest ${
                error ? "input-error" : ""
              }`}
              maxLength={6}
              disabled={verifyOTPLoading}
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={verifyOTPLoading || otp.length !== 6}
            >
              {verifyOTPLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              className="btn btn-outline"
              disabled={resendOTPLoading}
            >
              {resendOTPLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Resend"
              )}
            </button>
          </div>
        </form>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
