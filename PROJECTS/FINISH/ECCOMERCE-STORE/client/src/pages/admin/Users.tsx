import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, Users as UsersIcon, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", searchTerm],
    queryFn: async () => {
      const response = await api.get(`/admin/users?search=${searchTerm}`);
      return response.data.data;
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Users</h1>
        <p className="text-base-content/60">Manage platform users and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 border shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">Total Users</p>
                <h3 className="text-2xl font-bold">{usersData?.users?.length || 0}</h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 border shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">Admins</p>
                <h3 className="text-2xl font-bold">
                  {usersData?.users?.filter((u: User) => u.role === 'admin').length || 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-error/10">
                <Shield className="w-6 h-6 text-error" />
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 border shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">Verified</p>
                <h3 className="text-2xl font-bold">
                  {usersData?.users?.filter((u: User) => u.isEmailVerified).length || 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <Search className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card bg-base-100 border shadow-sm mb-6">
        <div className="card-body p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 border shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : !usersData?.users || usersData.users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center text-base-content/60">
                        <UsersIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">No users found</p>
                        <p className="text-sm">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usersData?.users?.map((user: User) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                              <span className="text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="font-semibold">{user.name}</div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" && (
                            <Shield className="w-4 h-4 text-error" />
                          )}
                          <select
                            className={`select select-sm ${
                              user.role === "admin"
                                ? "select-error"
                                : "select-bordered"
                            }`}
                            value={user.role}
                            onChange={(e) =>
                              updateUserRoleMutation.mutate({
                                userId: user._id,
                                role: e.target.value,
                              })
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            user.isEmailVerified
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {user.isEmailVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.role === "admin"}
                            title={user.role === "admin" ? "Cannot delete admin users" : "Delete user"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Delete User</h3>
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="bg-base-200 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                      <span className="text-sm">
                        {userToDelete.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{userToDelete.name}</p>
                    <p className="text-sm text-base-content/60">{userToDelete.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={handleCancelDelete}
                disabled={deleteUserMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleConfirmDelete}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
