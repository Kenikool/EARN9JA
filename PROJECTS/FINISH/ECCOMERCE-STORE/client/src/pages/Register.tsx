import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { User, Mail, Lock, Eye, EyeOff, Gift } from "lucide-react";
import { calculatePasswordStrength } from "../utils/passwordStrength";
import { SignUp } from "@clerk/clerk-react";

export default function Register() {
  const { register, isRegisterLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: referralCode || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = formData;
      register(registerData);
    }
  };

  useEffect(() => {
    if (referralCode) {
      setFormData(prev => ({ ...prev, referralCode }));
    }
  }, [referralCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live validation
    const newErrors: Record<string, string> = {};

    if (name === "name") {
      if (!value) {
        newErrors.name = "Name is required";
      } else if (value.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
    }

    if (name === "email") {
      if (!value) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = "Email is invalid";
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (value.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: newErrors[name] || "" }));
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center justify-center mb-2">
            Create Account
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Sign up to start shopping
          </p>

          {/* Referral Code Alert */}
          {formData.referralCode && (
            <div className="alert alert-success text-sm">
              <Gift className="w-5 h-5" />
              <span>Referral code applied! You'll earn 50 bonus points after registration.</span>
            </div>
          )}

          {/* Email Status Message */}
          <div className="alert alert-info text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>After registration, check your email for a verification link. If you don't receive it, you can request a new one.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className={`input input-bordered w-full pl-10 ${
                    errors.name ? "input-error" : ""
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isRegisterLoading}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
              </div>
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.name}
                  </span>
                </label>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? "input-error" : ""
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isRegisterLoading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errors.password ? "input-error" : ""
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isRegisterLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content z-10"
                  disabled={isRegisterLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-base-content/60">
                      Password strength:
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength.score === 0 || passwordStrength.score === 1
                          ? 'text-error'
                          : passwordStrength.score === 2
                          ? 'text-warning'
                          : passwordStrength.score === 3
                          ? 'text-info'
                          : 'text-success'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score === 0 || passwordStrength.score === 1
                          ? 'bg-error'
                          : passwordStrength.score === 2
                          ? 'bg-warning'
                          : passwordStrength.score === 3
                          ? 'bg-info'
                          : 'bg-success'
                      }`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    ></div>
                  </div>
                  
                  {/* Password Requirements Checklist */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={formData.password.length >= 8 ? 'text-success' : 'text-base-content/40'}>
                        {formData.password.length >= 8 ? '✓' : '○'}
                      </span>
                      <span className={formData.password.length >= 8 ? 'text-base-content' : 'text-base-content/60'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-success' : 'text-base-content/40'}>
                        {/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      <span className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-base-content' : 'text-base-content/60'}>
                        Uppercase & lowercase letters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={/\d/.test(formData.password) ? 'text-success' : 'text-base-content/40'}>
                        {/\d/.test(formData.password) ? '✓' : '○'}
                      </span>
                      <span className={/\d/.test(formData.password) ? 'text-base-content' : 'text-base-content/60'}>
                        At least one number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={/[^a-zA-Z\d]/.test(formData.password) ? 'text-success' : 'text-base-content/40'}>
                        {/[^a-zA-Z\d]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      <span className={/[^a-zA-Z\d]/.test(formData.password) ? 'text-base-content' : 'text-base-content/60'}>
                        Special character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Referral Code Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Referral Code (Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code"
                  className="input input-bordered w-full pl-10"
                  value={formData.referralCode}
                  onChange={handleChange}
                  disabled={isRegisterLoading}
                />
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
              </div>
              {formData.referralCode && (
                <label className="label">
                  <span className="label-text-alt text-success">
                    Earn 50 bonus points with this code!
                  </span>
                </label>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isRegisterLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content z-10"
                  disabled={isRegisterLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
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

            {/* Terms and Conditions */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  required
                />
                <span className="label-text text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Google Sign Up */}
          <div className="w-full">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-transparent",
                  footer: "hidden",
                  formButtonPrimary: "hidden",
                  formFieldInput: "hidden",
                  formFieldLabel: "hidden",
                  identityPreview: "hidden",
                  formResendCodeLink: "hidden",
                  otpCodeFieldInput: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "btn btn-outline w-full normal-case",
                  socialButtonsBlockButtonText: "text-base",
                },
              }}
              routing="hash"
              signInUrl="/login"
            />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
