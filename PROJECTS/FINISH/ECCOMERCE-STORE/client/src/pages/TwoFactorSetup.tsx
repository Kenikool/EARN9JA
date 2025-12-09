import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Shield, Copy, Download, Check } from 'lucide-react';
import api from '../services/api';

export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'enable' | 'verify'>('enable');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/2fa/enable');
      return data.data;
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('verify');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to enable 2FA');
    },
  });

  // Verify 2FA setup mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/auth/2fa/verify-setup', { token });
      return data.data;
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      toast.success('Two-factor authentication enabled successfully!');
      
      // Invalidate and refetch user query to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.refetchQueries({ queryKey: ['user'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Invalid verification code');
    },
  });

  const handleEnable = () => {
    enable2FAMutation.mutate();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      verify2FAMutation.mutate(verificationCode);
    } else {
      toast.error('Please enter a 6-digit code');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Secret key copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded!');
  };

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Backup codes copied!');
  };

  if (backupCodes.length > 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
            </div>

            <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
              2FA Enabled Successfully!
            </h2>

            <div className="alert alert-warning mb-4">
              <Shield className="w-5 h-5" />
              <span className="text-sm">
                Save these backup codes! You'll need them if you lose access to your authenticator app.
              </span>
            </div>

            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm text-center p-2 bg-base-100 rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={copyBackupCodes} className="btn btn-outline flex-1">
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button onClick={downloadBackupCodes} className="btn btn-outline flex-1">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            <button
              onClick={() => {
                // Ensure user data is fresh before navigating back
                queryClient.refetchQueries({ queryKey: ['user'] });
                navigate('/account-settings');
              }}
              className="btn btn-primary w-full mt-4"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center justify-center mb-4">
              Scan QR Code
            </h2>

            <p className="text-center text-base-content/70 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>

            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}

            <div className="divider">OR</div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Manual Entry Key</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secret}
                  readOnly
                  className="input input-bordered flex-1 font-mono text-sm"
                />
                <button onClick={copySecret} className="btn btn-square">
                  {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerify} className="mt-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Enter 6-Digit Code</span>
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="input input-bordered text-center text-2xl tracking-widest font-mono"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  disabled={verify2FAMutation.isPending}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-6"
                disabled={verify2FAMutation.isPending || verificationCode.length !== 6}
              >
                {verify2FAMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify & Enable'
                )}
              </button>
            </form>

            <button
              onClick={() => navigate('/account-settings')}
              className="btn btn-ghost w-full mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
            Enable Two-Factor Authentication
          </h2>

          <p className="text-center text-base-content/70 mb-6">
            Add an extra layer of security to your account
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="font-semibold">Enhanced Security</h3>
                <p className="text-sm text-base-content/70">
                  Protect your account from unauthorized access
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="font-semibold">Authenticator App</h3>
                <p className="text-sm text-base-content/70">
                  Use Google Authenticator, Authy, or similar apps
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-2xl">🔑</div>
              <div>
                <h3 className="font-semibold">Backup Codes</h3>
                <p className="text-sm text-base-content/70">
                  Get recovery codes in case you lose your device
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleEnable}
            className="btn btn-primary w-full"
            disabled={enable2FAMutation.isPending}
          >
            {enable2FAMutation.isPending ? (
              <>
                <span className="loading loading-spinner"></span>
                Setting up...
              </>
            ) : (
              'Get Started'
            )}
          </button>

          <button
            onClick={() => navigate('/account-settings')}
            className="btn btn-ghost w-full mt-2"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
