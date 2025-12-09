import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Monitor, Smartphone, Tablet, Shield, MapPin, Clock, Trash2, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
}

interface Location {
  country: string;
  city: string;
  region: string;
}

interface TrustedDevice {
  _id: string;
  name: string;
  deviceInfo: DeviceInfo;
  location: Location;
  lastSeen: string;
  createdAt: string;
  trustLevel: 'low' | 'medium' | 'high';
  isCurrent: boolean;
}

const TrustedDevices = () => {
  const [showTrustDialog, setShowTrustDialog] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const queryClient = useQueryClient();

  // Helper to safely format dates
  const formatLastSeen = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // Fetch trusted devices
  const { data: devicesData, isLoading } = useQuery({
    queryKey: ['trusted-devices'],
    queryFn: async () => {
      const response = await api.get('/auth/trusted-devices');
      return response.data.data;
    },
  });

  // Check current device
  const { data: deviceCheck } = useQuery({
    queryKey: ['device-check'],
    queryFn: async () => {
      const response = await api.get('/auth/trusted-devices/check');
      return response.data.data;
    },
  });

  // Trust device mutation
  const trustMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post('/auth/trusted-devices/trust', { name, expiresInDays: 30 });
    },
    onSuccess: () => {
      toast.success('Device trusted successfully');
      queryClient.invalidateQueries({ queryKey: ['trusted-devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-check'] });
      setShowTrustDialog(false);
      setDeviceName('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to trust device');
    },
  });

  // Untrust device mutation
  const untrustMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await api.delete(`/auth/trusted-devices/${deviceId}`);
    },
    onSuccess: () => {
      toast.success('Device removed successfully');
      queryClient.invalidateQueries({ queryKey: ['trusted-devices'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove device');
    },
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getTrustLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <div className="badge badge-success">High Trust</div>;
      case 'medium':
        return <div className="badge badge-info">Medium Trust</div>;
      case 'low':
        return <div className="badge badge-warning">Low Trust</div>;
      default:
        return null;
    }
  };

  const handleTrustDevice = () => {
    if (!deviceName.trim()) {
      toast.error('Please enter a device name');
      return;
    }
    trustMutation.mutate(deviceName);
  };

  const handleUntrustDevice = (device: TrustedDevice) => {
    if (window.confirm(`Remove ${device.name} from trusted devices?`)) {
      untrustMutation.mutate(device._id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const devices = devicesData?.devices || [];
  const currentDevice = devices.find((d: TrustedDevice) => d.isCurrent);
  const otherDevices = devices.filter((d: TrustedDevice) => !d.isCurrent);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Trusted Devices</h1>
            <p className="text-base-content/70">
              Manage devices that can skip 2FA verification. Remove any devices you don't recognize.
            </p>
          </div>

          {/* Current Device Status */}
          {deviceCheck && !deviceCheck.isTrusted && (
            <div className="alert alert-warning mb-6">
              <AlertTriangle className="h-5 w-5" />
              <div className="flex-1">
                <h3 className="font-semibold">Current Device Not Trusted</h3>
                <p className="text-sm">Trust this device to skip 2FA on future logins</p>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowTrustDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Trust This Device
              </button>
            </div>
          )}

          {deviceCheck?.isTrusted && (
            <div className="alert alert-success mb-6">
              <CheckCircle className="h-5 w-5" />
              <span>Current device is trusted</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <div className="stat-title">Trusted Devices</div>
              <div className="stat-value text-primary">{devices.length}</div>
            </div>
            
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-success">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="stat-title">Active Devices</div>
              <div className="stat-value text-success">
                {devices.filter((d: TrustedDevice) => 
                  new Date(d.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
            </div>
          </div>

          {/* Current Device */}
          {currentDevice && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Current Device
              </h2>
              <div className="card bg-base-100 shadow-xl border-2 border-success">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-success">
                        {getDeviceIcon(currentDevice.deviceInfo.device)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{currentDevice.name}</h3>
                        <p className="text-base-content/70 mb-2">
                          {currentDevice.deviceInfo.browser} on {currentDevice.deviceInfo.os}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                          {currentDevice.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {currentDevice.location.city && currentDevice.location.country
                                ? `${currentDevice.location.city}, ${currentDevice.location.country}`
                                : currentDevice.location.country || 'Unknown location'}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Active {formatLastSeen(currentDevice.lastSeen)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="badge badge-success">Current</div>
                      {getTrustLevelBadge(currentDevice.trustLevel)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Devices */}
          {otherDevices.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Other Trusted Devices ({otherDevices.length})
              </h2>
              <div className="space-y-4">
                {otherDevices.map((device: TrustedDevice) => (
                  <div key={device._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-base-content/60">
                            {getDeviceIcon(device.deviceInfo.device)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{device.name}</h3>
                            <p className="text-base-content/70 mb-2">
                              {device.deviceInfo.browser} on {device.deviceInfo.os}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                              {device.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {device.location.city && device.location.country
                                    ? `${device.location.city}, ${device.location.country}`
                                    : device.location.country || 'Unknown location'}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Last seen {formatLastSeen(device.lastSeen)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getTrustLevelBadge(device.trustLevel)}
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleUntrustDevice(device)}
                            disabled={untrustMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Devices */}
          {devices.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Trusted Devices</h3>
              <p className="text-base-content/60 mb-4">
                Trust devices to skip 2FA verification on future logins
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowTrustDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Trust This Device
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trust Device Dialog */}
      {showTrustDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Trust This Device</h3>
            <p className="text-sm text-base-content/70 mb-4">
              Give this device a name to help you identify it later. Trusted devices can skip 2FA verification.
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Device Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., My Laptop, Work Computer"
                className="input input-bordered"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrustDevice()}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowTrustDialog(false);
                  setDeviceName('');
                }}
                disabled={trustMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleTrustDevice}
                disabled={trustMutation.isPending}
              >
                {trustMutation.isPending && <span className="loading loading-spinner loading-sm mr-2"></span>}
                Trust Device
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowTrustDialog(false)}></div>
        </div>
      )}
    </div>
  );
};

export default TrustedDevices;
