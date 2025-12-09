import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { calculatePasswordStrength } from '../utils/passwordStrength';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = calculatePasswordStrength(formData.password);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await api.put(`/auth/reset-password/${data.token}`, {
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Password reset failed');
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    if (validateForm()) {
      resetPasswordMutation.mutate({ token, password: formData.password });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Live validation
    const newErrors: Record<string, string> = {};
    
    if (name === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (name === 'confirmPassword') {
      if (!value) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(prev => ({ ...prev, [name]: newErrors[name] || '' }));
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl font-bold justify-center mb-4 text-error">
              Invalid Reset Link
            </h2>
            <p className="text-base-content/70 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn btn-primary w-full">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center justify-center mb-2">
            Reset Password
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter new password"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errors.password ? 'input-error' : ''
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={resetPasswordMutation.isPending}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content z-10"
                  disabled={resetPasswordMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-base-content/60">Password strength:</span>
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

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errors.confirmPassword ? 'input-error' : ''
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={resetPasswordMutation.isPending}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content z-10"
                  disabled={resetPasswordMutation.isPending}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="divider">OR</div>

          <Link to="/login" className="btn btn-ghost w-full">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
