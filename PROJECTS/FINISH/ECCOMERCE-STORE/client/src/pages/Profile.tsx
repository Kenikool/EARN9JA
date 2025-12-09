import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  MapPin,
  Lock,
  Camera,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { User as UserType, Address } from "../types";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    avatar: "",
  });

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Address form state
  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    isDefault: false,
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data.data.user as UserType;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; avatar?: string }) => {
      const response = await api.put("/auth/profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await api.put("/auth/password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ addresses }: { addresses: Address[] }) => {
      const response = await api.put("/auth/profile", { addresses });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Address updated successfully");
      setIsAddingAddress(false);
      setEditingAddress(null);
      resetAddressForm();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update address");
    },
  });

  const resetAddressForm = () => {
    setAddressData({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      isDefault: false,
    });
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleAddressSubmit = () => {
    if (!userData?.addresses) return;

    let updatedAddresses = [...userData.addresses];

    if (editingAddress) {
      // Update existing address
      const addressId = editingAddress._id || Date.now().toString();
      updatedAddresses = updatedAddresses.map((addr) =>
        addr._id === addressId ? { ...addressData, _id: addressId } : addr
      );
    } else {
      // Add new address
      const newAddress = { ...addressData, _id: Date.now().toString() };
      updatedAddresses.push(newAddress);
    }

    // If this is set as default, remove default from others
    if (addressData.isDefault) {
      const newAddressId = editingAddress?._id || Date.now().toString();
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === newAddressId,
      }));
    }

    updateAddressMutation.mutate({ addresses: updatedAddresses });
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!userData?.addresses) return;

    const updatedAddresses = userData.addresses.filter(
      (addr) => addr._id !== addressId
    );
    updateAddressMutation.mutate({ addresses: updatedAddresses });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault || false,
    });
    setIsAddingAddress(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-base-300 rounded w-1/4"></div>
          <div className="h-64 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  const addresses = userData?.addresses || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-base-content/60">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8">
          <button
            className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4 mr-2" style={{ color: '#8b5cf6' }} />
            Profile
          </button>
          <button
            className={`tab ${activeTab === "addresses" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <MapPin className="w-4 h-4 mr-2" style={{ color: '#ef4444' }} />
            Addresses ({addresses.length})
          </button>
          <button
            className={`tab ${activeTab === "security" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Lock className="w-4 h-4 mr-2" style={{ color: '#f59e0b' }} />
            Security
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="card-title">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" style={{ color: '#3b82f6' }} />
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                      {profileData.avatar ? (
                        <img
                          src={profileData.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12" style={{ color: '#8b5cf6' }} />
                      )}
                    </div>
                    {isEditing && (
                      <button className="btn btn-sm btn-outline">
                        <Camera className="w-3 h-3 mr-1" style={{ color: '#f59e0b' }} />
                        Change
                      </button>
                    )}
                  </div>

                  {/* Profile Form */}
                  <div className="flex-1 space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input input-bordered"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-lg">{userData?.name}</p>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: '#f59e0b' }} />
                        <p className="text-lg">{userData?.email}</p>
                        <div className="badge badge-sm badge-success">
                          <CheckCircle className="w-3 h-3 mr-1" style={{ color: '#ffffff' }} />
                          Verified
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Account Type</span>
                      </label>
                      <div className="badge badge-primary badge-lg">
                        <User className="w-3 h-3 mr-1" style={{ color: '#ffffff' }} />
                        {userData?.role}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <button
                          onClick={handleProfileUpdate}
                          disabled={updateProfileMutation.isPending}
                          className="btn btn-primary"
                        >
                          <Save className="w-4 h-4 mr-2" style={{ color: '#ffffff' }} />
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn btn-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Shipping Addresses</h2>
              <button
                onClick={() => {
                  setIsAddingAddress(true);
                  setEditingAddress(null);
                  resetAddressForm();
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" style={{ color: '#22c55e' }} />
                Add Address
              </button>
            </div>

            {/* Address Form */}
            {isAddingAddress && (
              <div className="card bg-base-100 border">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title">
                      {editingAddress ? "Edit Address" : "Add New Address"}
                    </h3>
                    <button
                      onClick={() => {
                        setIsAddingAddress(false);
                        setEditingAddress(null);
                        resetAddressForm();
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      <X className="w-4 h-4" style={{ color: '#ef4444' }} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={addressData.fullName}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone *</span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered"
                        value={addressData.phone}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="md:col-span-2 form-control">
                      <label className="label">
                        <span className="label-text">Address Line 1 *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={addressData.addressLine1}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            addressLine1: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="md:col-span-2 form-control">
                      <label className="label">
                        <span className="label-text">Address Line 2</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={addressData.addressLine2}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            addressLine2: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">City *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={addressData.city}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">State/Province *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={addressData.state}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            state: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Zip Code *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={addressData.zipCode}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            zipCode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Country *</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={addressData.country}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            country: e.target.value,
                          })
                        }
                      >
                        <option value="US">United States</option>
                        <option value="NG">Nigeria</option>
                        <option value="GH">Ghana</option>
                        <option value="ZA">South Africa</option>
                        <option value="KE">Kenya</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Set as default address</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={addressData.isDefault}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            isDefault: e.target.checked,
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleAddressSubmit}
                      disabled={updateAddressMutation.isPending}
                      className="btn btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" style={{ color: '#ffffff' }} />
                      {updateAddressMutation.isPending
                        ? "Saving..."
                        : editingAddress
                        ? "Update Address"
                        : "Add Address"}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingAddress(false);
                        setEditingAddress(null);
                        resetAddressForm();
                      }}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Address List */}
            <div className="grid gap-4">
              {addresses.length === 0 ? (
                <div className="card bg-base-100 border">
                  <div className="card-body text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                    <p className="text-base-content/60">
                      No addresses added yet
                    </p>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="btn btn-outline mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" style={{ color: '#3b82f6' }} />
                      Add Your First Address
                    </button>
                  </div>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className="card bg-base-100 border">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {address.fullName}
                            </h3>
                            {address.isDefault && (
                              <div className="badge badge-primary badge-sm">
                                <CheckCircle className="w-3 h-3 mr-1" style={{ color: '#ffffff' }} />
                                Default
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-base-content/80 space-y-1">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && (
                              <p>{address.addressLine2}</p>
                            )}
                            <p>
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p>{address.country}</p>
                            <p>Phone: {address.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="btn btn-ghost btn-sm"
                          >
                            <Edit className="w-4 h-4" style={{ color: '#3b82f6' }} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id!)}
                            className="btn btn-ghost btn-sm text-error"
                          >
                            <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h2 className="card-title mb-6">Change Password</h2>

                <div className="space-y-4 max-w-md">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Current Password *</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">New Password *</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Confirm New Password *</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="alert alert-info">
                    <AlertCircle className="w-4 h-4" style={{ color: '#3b82f6' }} />
                    <span className="text-sm">
                      Password must be at least 8 characters long and contain a
                      mix of letters, numbers, and symbols.
                    </span>
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={
                      changePasswordMutation.isPending ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                    className="btn btn-primary"
                  >
                    <Lock className="w-4 h-4 mr-2" style={{ color: '#ffffff' }} />
                    {changePasswordMutation.isPending
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h3 className="card-title mb-4">Account Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-base-content/60">
                        Your email is verified
                      </p>
                    </div>
                    <div className="badge badge-success">
                      <CheckCircle className="w-3 h-3 mr-1" style={{ color: '#ffffff' }} />
                      Verified
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-base-content/60">
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      <Lock className="w-3 h-3 mr-1" style={{ color: '#f59e0b' }} />
                      Setup 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
