import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // Prevent double verification

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double verification
      if (hasVerified.current) {
        return;
      }

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      // Mark as verified to prevent duplicate calls
      hasVerified.current = true;

      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (error: unknown) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Link may be expired.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h2 className="card-title text-2xl font-bold justify-center mb-2">
                Verifying Your Email...
              </h2>
              <p className="text-base-content/70">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-success" />
                </div>
              </div>
              <h2 className="card-title text-2xl font-bold justify-center mb-2 text-success">
                Email Verified!
              </h2>
              <p className="text-base-content/70 mb-6">{message}</p>
              <Link to="/login" className="btn btn-primary w-full">
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-error" />
                </div>
              </div>
              <h2 className="card-title text-2xl font-bold justify-center mb-2 text-error">
                Verification Failed
              </h2>
              <p className="text-base-content/70 mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/register" className="btn btn-primary w-full">
                  Register Again
                </Link>
                <Link to="/login" className="btn btn-ghost w-full">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
