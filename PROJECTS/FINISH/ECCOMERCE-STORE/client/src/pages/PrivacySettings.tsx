import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Shield, Mail, Database, Download, Trash2 } from 'lucide-react';
import api from '../services/api';

interface PrivacySettings {
  marketingEmails: boolean;
  securityAlerts: boolean;
  dataSharing: boolean;
}

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PrivacySettings>({
    marketingEmails: true,
    securityAlerts: true,
    dataSharing: false,
  });
  const queryClient = useQueryClient();

  // Fetch privacy settings
  const { isLoading, data } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async () => {
      const response = await api.get('/auth/privacy/settings');
      return response.data.data;
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (data?.privacySettings) {
      setSettings(data.privacySettings);
    }
  }, [data]);

  // Update privacy settings
  const updateMutation = useMutation({
    mutationFn: async (newSettings: PrivacySettings) => {
      await api.put('/auth/privacy/settings', newSettings);
    },
    onSuccess: () => {
      toast.success('Privacy settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update settings');
    },
  });

  // Request data export
  const exportMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/account/export-data');
    },
    onSuccess: () => {
      toast.success('Data export requested. Check your email for the download link.');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to request data export');
    },
  });

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateMutation.mutate(newSettings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Privacy Settings</h1>
            <p className="text-base-content/70">
              Control how your data is used and what communications you receive.
            </p>
          </div>

          {/* Privacy Controls */}
          <div className="grid gap-6">
            {/* Email Preferences */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Marketing Emails</h3>
                      <p className="text-sm text-base-content/70">
                        Receive promotional emails about new features and offers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.marketingEmails}
                      onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div className="divider"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Security Alerts</h3>
                      <p className="text-sm text-base-content/70">
                        Receive important security notifications (recommended)
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      checked={settings.securityAlerts}
                      onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Sharing
                </h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Analytics Data Sharing</h3>
                    <p className="text-sm text-base-content/70">
                      Share anonymized usage data to help improve our services
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={settings.dataSharing}
                    onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Data Export */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export
                </h2>
                
                <p className="text-base-content/70 mb-4">
                  Download a copy of all your personal data in JSON format. This includes your profile, 
                  orders, reviews, and activity history.
                </p>
                
                <button
                  className="btn btn-outline btn-primary"
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                >
                  {exportMutation.isPending && <span className="loading loading-spinner loading-sm mr-2"></span>}
                  <Download className="h-4 w-4 mr-2" />
                  Request Data Export
                </button>
              </div>
            </div>

            {/* Account Deletion */}
            <div className="card bg-base-100 shadow-xl border-2 border-error">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2 text-error">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </h2>
                
                <div className="alert alert-warning mb-4">
                  <span>
                    Deleting your account is permanent and cannot be undone. All your data will be removed.
                  </span>
                </div>
                
                <p className="text-base-content/70 mb-4">
                  If you delete your account, we will:
                </p>
                <ul className="list-disc list-inside text-sm text-base-content/70 mb-4 space-y-1">
                  <li>Permanently delete your profile and personal information</li>
                  <li>Remove your reviews and ratings</li>
                  <li>Anonymize your order history for business records</li>
                  <li>Cancel any active subscriptions</li>
                </ul>
                
                <button
                  className="btn btn-error"
                  onClick={() => navigate('/account-management')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Manage Account Deletion
                </button>
              </div>
            </div>

            {/* GDPR Notice */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Rights
                </h2>
                
                <div className="text-sm text-base-content/70 space-y-2">
                  <p>
                    Under GDPR and other privacy laws, you have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your data</li>
                    <li>Restrict processing of your data</li>
                    <li>Data portability</li>
                    <li>Object to processing</li>
                  </ul>
                  <p className="mt-4">
                    For questions about your privacy rights, contact our Data Protection Officer at{' '}
                    <a href="mailto:privacy@example.com" className="link link-primary">
                      privacy@example.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
