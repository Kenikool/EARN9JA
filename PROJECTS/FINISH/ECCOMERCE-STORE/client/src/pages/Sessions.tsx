import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface SessionData {
  _id: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
    userAgent: string;
  };
  ipAddress: string;
  location: {
    country: string;
    city: string;
    region: string;
  };
  lastActivity: string;
  createdAt: string;
  isTrusted: boolean;
  isCurrent: boolean;
}

interface SessionsResponse {
  sessions: SessionData[];
  total: number;
}

const Sessions = () => {
  const queryClient = useQueryClient();

  // Fetch sessions
  const { data: sessionsData, isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: async (): Promise<SessionsResponse> => {
      const response = await api.get('/auth/sessions');
      return response.data.data;
    },
  });

  // Revoke single session
  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/auth/sessions/${sessionId}`);
    },
    onSuccess: () => {
      toast.success('Session revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to revoke session');
    },
  });

  // Logout from all devices
  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/auth/sessions/all');
    },
    onSuccess: () => {
      toast.success('Logged out from all other devices');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to logout from all devices');
    },
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      revokeMutation.mutate(sessionId);
    }
  };

  const handleLogoutAll = () => {
    if (window.confirm('Are you sure you want to logout from all other devices? This will end all your other sessions.')) {
      logoutAllMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <AlertTriangle className="h-6 w-6" />
          <span>Failed to load sessions</span>
        </div>
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];
  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Active Sessions</h1>
            <p className="text-base-content/70">
              Manage your active sessions across all devices. You can revoke access from devices you don't recognize.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-primary">
                <Monitor className="h-8 w-8" />
              </div>
              <div className="stat-title">Total Sessions</div>
              <div className="stat-value text-primary">{sessions.length}</div>
            </div>
            
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-success">
                <Shield className="h-8 w-8" />
              </div>
              <div className="stat-title">Trusted Devices</div>
              <div className="stat-value text-success">
                {sessions.filter(s => s.isTrusted).length}
              </div>
            </div>
            
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-warning">
                <Clock className="h-8 w-8" />
              </div>
              <div className="stat-title">Recent Activity</div>
              <div className="stat-value text-sm">
                {currentSession ? formatDistanceToNow(new Date(currentSession.lastActivity), { addSuffix: true }) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="btn btn-error"
              onClick={handleLogoutAll}
              disabled={logoutAllMutation.isPending || otherSessions.length === 0}
            >
              {logoutAllMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
              Logout from All Other Devices
            </button>
          </div>

          {/* Current Session */}
          {currentSession && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Current Session
              </h2>
              <div className="card bg-base-100 shadow-xl border-2 border-success">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-success">
                        {getDeviceIcon(currentSession.deviceInfo.device)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {currentSession.deviceInfo.browser}
                        </h3>
                        <p className="text-base-content/70 mb-2">
                          {currentSession.deviceInfo.os}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {currentSession.location.city}, {currentSession.location.country}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Active {formatDistanceToNow(new Date(currentSession.lastActivity), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-success">Current</div>
                      {currentSession.isTrusted && (
                        <div className="badge badge-info">Trusted</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Sessions */}
          {otherSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Other Sessions ({otherSessions.length})
              </h2>
              <div className="space-y-4">
                {otherSessions.map((session) => (
                  <div key={session._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-base-content/60">
                            {getDeviceIcon(session.deviceInfo.device)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {session.deviceInfo.browser}
                            </h3>
                            <p className="text-base-content/70 mb-2">
                              {session.deviceInfo.os}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {session.location.city}, {session.location.country}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Last active {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.isTrusted && (
                            <div className="badge badge-info">Trusted</div>
                          )}
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleRevokeSession(session._id)}
                            disabled={revokeMutation.isPending}
                          >
                            {revokeMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Other Sessions */}
          {otherSessions.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Other Active Sessions</h3>
              <p className="text-base-content/60">
                You're only logged in on this device. Great security practice!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
