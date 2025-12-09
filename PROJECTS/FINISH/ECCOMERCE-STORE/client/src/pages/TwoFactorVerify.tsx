import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Shield, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const userId = location.state?.userId;
  const twoFactorMethod = location.state?.twoFactorMethod || 'authenticator';

  useEffect(() => {
    if (!userId) {
      toast.error('Invalid session');
      navigate('/login');
    }
  }, [userId, navigate]);

  const verify2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/auth/2fa/verify-login', {
        token,
        userId,
      });
      return data.data;
    },
    onSuccess: (data) => {
      if (data.verified) {
        // Store tokens and user data
        const { storage } = require('../utils/storage');
        storage.setAccessToken(data.accessToken);
        storage.setRefreshToken(data.refreshToken);
        storage.setUser(data.user);
        
        toast.success('Login successful!');
        
        if (data.backupCodeUsed) {
          toast(`You have ${data.remainingBackupCodes} backup codes remaining`, {
            icon: '⚠️',
          });
        }
        
        // Redirect to shop
        navigate('/shop');
        
        // Reload to update auth state
        window.location.reload();
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Invalid verification code');
      setCode('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useBackupCode) {
      if (code.length === 8) {
        verify2FAMutation.mutate(code);
      } else {
        toast.error('Backup codes are 8 characters');
      }
    } else {
      if (code.length === 6) {
        verify2FAMutation.mutate(code);
      } else {
        toast.error('Please enter a 6-digit code');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ghost btn-sm self-start mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
            Two-Factor Authentication
          </h2>

          <p className="text-center text-base-content/70 mb-6">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : `Enter the ${twoFactorMethod === 'email' ? 'code from your email' : 'code from your authenticator app'}`}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  {useBackupCode ? 'Backup Code' : 'Verification Code'}
                </span>
              </label>
              <input
                type="text"
                placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                maxLength={useBackupCode ? 8 : 6}
                className="input input-bordered text-center text-2xl tracking-widest font-mono"
                value={code}
                onChange={(e) => {
                  const value = useBackupCode 
                    ? e.target.value.toUpperCase()
                    : e.target.value.replace(/\D/g, '');
                  setCode(value);
                }}
                disabled={verify2FAMutation.isPending}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={
                verify2FAMutation.isPending ||
                (useBackupCode ? code.length !== 8 : code.length !== 6)
              }
            >
              {verify2FAMutation.isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </form>

          <div className="divider">OR</div>

          <button
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
            }}
            className="btn btn-ghost btn-sm w-full"
          >
            {useBackupCode ? 'Use Authenticator Code' : 'Use Backup Code'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-base-content/60">
              Lost access to your authenticator?{' '}
              <a href="/support" className="link link-primary">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
