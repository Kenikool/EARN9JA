import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    },
    onSuccess: () => {
      setEmailSent(true);
      toast.success('Password reset link sent to your email!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-success" />
              </div>
            </div>
            <h2 className="card-title text-2xl font-bold justify-center mb-2">
              Check Your Email
            </h2>
            <p className="text-base-content/70 mb-4">
              We've sent a password reset link to:
            </p>
            <p className="font-semibold text-lg mb-6">{email}</p>
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-base-content/70">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary w-full">
              Back to Login
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
          <Link to="/login" className="flex items-center text-sm text-base-content/60 hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>

          <h2 className="card-title text-3xl font-bold text-center justify-center mb-2">
            Forgot Password?
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Enter your email and we'll send you a link to reset your password
          </p>

          {/* Email Status Message */}
          <div className="alert alert-info text-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>If you don't receive the email within a few minutes, check your spam folder or try again.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={forgotPasswordMutation.isPending}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
