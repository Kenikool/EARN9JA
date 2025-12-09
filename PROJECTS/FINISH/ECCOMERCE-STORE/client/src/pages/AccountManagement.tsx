import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AlertTriangle, Trash2, Pause, Shield } from 'lucide-react';
import api from '../services/api';

interface AccountStatus {
  accountStatus: string;
  deletionScheduledFor?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

const AccountManagement = () => {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const queryClient = useQueryClient();

  // Fetch account status
  const { data: accountData, isLoading } = useQuery({
    queryKey: ['account-status'],
    queryFn: async (): Promise<AccountStatus> => {
      const response = await api.get('/auth/me');
      return response.data.data;
    },
  });

  // Deactivate account
  const deactivateMutation = useMutation({
    mutationFn: async (password: string) => {
      await api.post('/auth/account/deactivate', { password });
    },
    onSuccess: () => {
      toast.success('Account deactivated successfully');
      setShowDeactivateModal(false);
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['account-status'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to deactivate account');
    },
  });

  // Schedule deletion
  const deleteMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      await api.post('/auth/account/delete', data);
    },
    onSuccess: () => {
      toast.success('Account deletion scheduled. You have 30 days to cancel.');
      setShowDeleteModal(false);
      setPassword('');
      setDeleteConfirmation('');
      queryClient.invalidateQueries({ queryKey: ['account-status'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to schedule deletion');
    },
  });

  // Cancel deletion
  const cancelDeletionMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/account/cancel-deletion');
    },
    onSuccess: () => {
      toast.success('Account deletion cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['account-status'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to cancel deletion');
    },
  });

  const handleDeactivate = () => {
    if (!password) {
      toast.error('Password is required');
      return;
    }
    deactivateMutation.mutate(password);
  };

  const handleDelete = () => {
    if (!password) {
      toast.error('Password is required');
      return;
    }
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }
    deleteMutation.mutate({ password });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const isScheduledForDeletion = accountData?.accountStatus === 'scheduled_deletion';
  const deletionDate = accountData?.deletionScheduledFor ? new Date(accountData.deletionScheduledFor) : null;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Management</h1>
            <p className="text-base-content/70">
              Manage your account status, deactivation, and deletion settings.
            </p>
          </div>

          {/* Account Status */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: '#7c3aed' }} />
                Account Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat">
                  <div className="stat-title">Account Status</div>
                  <div className={`stat-value text-lg ${
                    accountData?.accountStatus === 'active' ? 'text-success' :
                    accountData?.accountStatus === 'deactivated' ? 'text-warning' :
                    'text-error'
                  }`}>
                    {accountData?.accountStatus === 'active' && 'Active'}
                    {accountData?.accountStatus === 'deactivated' && 'Deactivated'}
                    {accountData?.accountStatus === 'scheduled_deletion' && 'Scheduled for Deletion'}
                  </div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Email Verified</div>
                  <div className={`stat-value text-lg ${
                    accountData?.isEmailVerified ? 'text-success' : 'text-error'
                  }`}>
                    {accountData?.isEmailVerified ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deletion Warning */}
          {isScheduledForDeletion && deletionDate && (
            <div className="alert alert-error mb-6">
              <AlertTriangle className="h-6 w-6" style={{ color: '#ef4444' }} />
              <div>
                <h3 className="font-bold">Account Scheduled for Deletion</h3>
                <div className="text-sm">
                  Your account will be permanently deleted on {deletionDate.toLocaleDateString()}.
                  You can cancel this at any time before the deletion date.
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => cancelDeletionMutation.mutate()}
                disabled={cancelDeletionMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" style={{ color: '#ef4444' }} />
                {cancelDeletionMutation.isPending && <span className="loading loading-spinner loading-xs mr-1"></span>}
                Cancel Deletion
              </button>
            </div>
          )}

          {/* Account Actions */}
          <div className="grid gap-6">
            {/* Deactivate Account */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2">
                  <Pause className="h-5 w-5" style={{ color: '#f59e0b' }} />
                  Deactivate Account
                </h2>
                
                <p className="text-base-content/70 mb-4">
                  Temporarily deactivate your account. You can reactivate it anytime by logging in again.
                </p>
                
                <div className="alert alert-info mb-4">
                  <Shield className="h-5 w-5" style={{ color: '#3b82f6' }} />
                  <span>
                    When deactivated, your account will be hidden but your data will be preserved.
                  </span>
                </div>
                
                <button
                  className="btn btn-warning"
                  onClick={() => setShowDeactivateModal(true)}
                  disabled={accountData?.accountStatus !== 'active'}
                >
                  <Pause className="h-4 w-4 mr-2" style={{ color: '#ffffff' }} />
                  Deactivate Account
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="card bg-base-100 shadow-xl border-2 border-error">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2 text-error">
                  <Trash2 className="h-5 w-5" style={{ color: '#ef4444' }} />
                  Delete Account
                </h2>
                
                <div className="alert alert-error mb-4">
                  <AlertTriangle className="h-6 w-6" style={{ color: '#ef4444' }} />
                  <div>
                    <h3 className="font-bold">Permanent Action</h3>
                    <div className="text-sm">
                      Account deletion is permanent and cannot be undone. You have 30 days to cancel.
                    </div>
                  </div>
                </div>
                
                <p className="text-base-content/70 mb-4">
                  When you delete your account:
                </p>
                <ul className="list-disc list-inside text-sm text-base-content/70 mb-4 space-y-1">
                  <li>Your profile and personal data will be permanently deleted</li>
                  <li>Your reviews and ratings will be removed</li>
                  <li>Order history will be anonymized for business records</li>
                  <li>You'll have 30 days to cancel before permanent deletion</li>
                </ul>
                
                <button
                  className="btn btn-error"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isScheduledForDeletion}
                >
                  <Trash2 className="h-4 w-4 mr-2" style={{ color: '#ffffff' }} />
                  {isScheduledForDeletion ? 'Deletion Scheduled' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Account Deactivation</h3>
            <p className="mb-4">Enter your password to confirm account deactivation:</p>
            
            <div className="form-control mb-4">
              <input
                type="password"
                placeholder="Your password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeactivateModal(false);
                  setPassword('');
                }}
                disabled={deactivateMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending && <span className="loading loading-spinner loading-sm mr-2"></span>}
                Deactivate Account
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeactivateModal(false)}></div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-error">Confirm Account Deletion</h3>
            
            <div className="alert alert-error mb-4">
              <AlertTriangle className="h-6 w-6" />
              <span>This action cannot be undone. Your account will be scheduled for permanent deletion.</span>
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Enter your password:</span>
              </label>
              <input
                type="password"
                placeholder="Your password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Type "DELETE" to confirm:</span>
              </label>
              <input
                type="text"
                placeholder="DELETE"
                className="input input-bordered"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>
            
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword('');
                  setDeleteConfirmation('');
                }}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <span className="loading loading-spinner loading-sm mr-2"></span>}
                Schedule Deletion
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
