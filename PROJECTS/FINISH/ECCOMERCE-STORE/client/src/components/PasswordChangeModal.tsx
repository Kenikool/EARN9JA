import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExpired?: boolean;
  isForced?: boolean;
}

const PasswordChangeModal = ({ isOpen, onClose, isExpired = false, isForced = false }: PasswordChangeModalProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post('/auth/security/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to change password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center gap-3 mb-4">
          {(isExpired || isForced) && <AlertTriangle className="h-6 w-6 text-warning" />}
          {!isExpired && !isForced && <Lock className="h-6 w-6 text-primary" />}
          <h3 className="font-bold text-lg">
            {isExpired ? 'Password Expired' : isForced ? 'Password Change Required' : 'Change Password'}
          </h3>
        </div>

        {isExpired && (
          <div className="alert alert-warning mb-4">
            <span>Your password has expired. Please change it to continue.</span>
          </div>
        )}

        {isForced && (
          <div className="alert alert-info mb-4">
            <span>You must change your password before continuing.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Current Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              minLength={8}
            />
            <label className="label">
              <span className="label-text-alt">Must be at least 8 characters</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm New Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className="modal-action">
            {!isExpired && !isForced && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending && <span className="loading loading-spinner loading-sm mr-2"></span>}
              Change Password
            </button>
          </div>
        </form>
      </div>
      {!isExpired && !isForced && (
        <div className="modal-backdrop" onClick={onClose}></div>
      )}
    </div>
  );
};

export default PasswordChangeModal;
