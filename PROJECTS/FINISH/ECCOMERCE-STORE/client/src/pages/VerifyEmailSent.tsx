import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function VerifyEmailSent() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || 'your email';

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/resend-verification', { email });
      return data;
    },
    onSuccess: () => {
      toast.success('Verification email sent!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to resend email');
    },
  });

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h2 className="card-title text-2xl font-bold justify-center mb-2">
            Check Your Email
          </h2>
          
          <p className="text-base-content/70 mb-4">
            We've sent a verification link to:
          </p>
          
          <p className="font-semibold text-lg mb-6">{email}</p>
          
          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-base-content/70">
              Click the link in the email to verify your account. The link will expire in 24 hours.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/login" className="btn btn-primary w-full">
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            
            <p className="text-sm text-base-content/60">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {resendMutation.isPending ? 'Sending...' : 'resend verification email'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
