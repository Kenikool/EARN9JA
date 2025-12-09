import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { calculatePasswordStrength } from '../utils/passwordStrength';
import { storage } from '../utils/storage';

export default function AccountSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or default to 'profile'
  const tabFromUrl = searchParams.get('tab') as 'profile' | 'password' | 'security' | null;
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>(
    tabFromUrl && ['profile', 'password', 'security'].includes(tabFromUrl) ? tabFromUrl : 'profile'
  );

  // Refetch user data when component mounts to ensure fresh data
  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ['user'] });
  }, [queryClient]);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Disable 2FA modal state
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the user in React Query cache
      const updatedUser = data.data.user;
      queryClient.setQueryData(['user'], updatedUser);
      
      // Update localStorage
      storage.setUser(updatedUser);
      
      // Invalidate to refetch from server (ensures consistency)
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      toast.success('Profile updated successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/auth/password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to change password');
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await api.post('/auth/2fa/disable', { password });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Two-factor authentication disabled successfully!');
      setShowDisable2FAModal(false);
      setDisable2FAPassword('');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.refetchQueries({ queryKey: ['user'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to disable 2FA');
    },
  });

  const handleDisable2FA = () => {
    setShowDisable2FAModal(true);
  };

  const handleConfirmDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disable2FAPassword) {
      toast.error('Please enter your password');
      return;
    }
    disable2FAMutation.mutate(disable2FAPassword);
  };

  const handleCancelDisable2FA = () => {
    setShowDisable2FAModal(false);
    setDisable2FAPassword('');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      changePasswordMutation.mutate({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Profile Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={updateProfileMutation.isPending}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#8b5cf6' }} />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={updateProfileMutation.isPending}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#f59e0b' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Two-Factor Authentication</h2>
              <p className="text-base-content/70 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              
              {user?.twoFactorEnabled ? (
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">2FA is enabled</h3>
                    <div className="text-xs">Your account is protected with two-factor authentication</div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">2FA is not enabled</h3>
                    <div className="text-xs">Enable 2FA to secure your account</div>
                  </div>
                </div>
              )}

              <div className="card-actions justify-end mt-4">
                {user?.twoFactorEnabled ? (
                  <button 
                    className="btn btn-outline btn-error"
                    onClick={handleDisable2FA}
                    disabled={disable2FAMutation.isPending}
                  >
                    {disable2FAMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      'Disable 2FA'
                    )}
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/2fa-setup')}
                  >
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Recent Login Activity</h2>
              <p className="text-base-content/70 mb-4">
                Review your recent login activity to ensure your account is secure.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Current Session</p>
                      <p className="text-sm text-base-content/60">Chrome on Windows • Just now</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
                
                <button 
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => navigate('/sessions')}
                >
                  View Full Login History
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Active Sessions</h2>
              <p className="text-base-content/70 mb-4">
                Manage devices where you're currently logged in.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">This Device</p>
                      <p className="text-sm text-base-content/60">Last active: Just now</p>
                    </div>
                  </div>
                  <span className="badge badge-primary">Current</span>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/sessions')}
                >
                  Manage Sessions
                </button>
              </div>
            </div>
          </div>

          {/* Trusted Devices */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Trusted Devices</h2>
              <p className="text-base-content/70 mb-4">
                Manage devices that can skip 2FA verification. Remove any devices you don't recognize.
              </p>
              
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Trusted devices can skip 2FA verification for faster login</span>
              </div>

              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/trusted-devices')}
                >
                  Manage Trusted Devices
                </button>
              </div>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Security Recommendations</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Email Verified</p>
                    <p className="text-sm text-base-content/60">Your email address has been verified</p>
                  </div>
                </div>

                {!user?.twoFactorEnabled && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-base-content/60">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-info flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Use a Strong Password</p>
                    <p className="text-sm text-base-content/60">Make sure your password is unique and complex</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    className={`input input-bordered w-full pl-10 pr-10 ${
                      passwordErrors.currentPassword ? 'input-error' : ''
                    }`}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10" style={{ color: '#6b7280' }} />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                    tabIndex={-1}
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" style={{ color: '#ef4444' }} /> : <Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{passwordErrors.currentPassword}</span>
                  </label>
                )}
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    className={`input input-bordered w-full pl-10 pr-10 ${
                      passwordErrors.newPassword ? 'input-error' : ''
                    }`}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10" style={{ color: '#6b7280' }} />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                    tabIndex={-1}
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" style={{ color: '#ef4444' }} /> : <Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{passwordErrors.newPassword}</span>
                  </label>
                )}
                
                {/* Password Strength */}
                {passwordData.newPassword && (
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
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`input input-bordered w-full pl-10 pr-10 ${
                      passwordErrors.confirmPassword ? 'input-error' : ''
                    }`}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10" style={{ color: '#6b7280' }} />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                    tabIndex={-1}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" style={{ color: '#ef4444' }} /> : <Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{passwordErrors.confirmPassword}</span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Disable Two-Factor Authentication</h3>
            <p className="text-base-content/70 mb-4">
              Are you sure you want to disable 2FA? This will make your account less secure.
            </p>
            
            <form onSubmit={handleConfirmDisable2FA}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Enter your password to confirm</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={disable2FAPassword}
                  onChange={(e) => setDisable2FAPassword(e.target.value)}
                  placeholder="Your password"
                  autoFocus
                  disabled={disable2FAMutation.isPending}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCancelDisable2FA}
                  disabled={disable2FAMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-error"
                  disabled={disable2FAMutation.isPending || !disable2FAPassword}
                >
                  {disable2FAMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Disabling...
                    </>
                  ) : (
                    'Disable 2FA'
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={handleCancelDisable2FA}></div>
        </div>
      )}
    </div>
  );
}
