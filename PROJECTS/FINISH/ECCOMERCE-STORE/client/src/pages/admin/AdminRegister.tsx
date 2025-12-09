import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Verify admin code (you should set this in your environment)
      const ADMIN_REGISTRATION_CODE = "ADMIN2024"; // Change this!
      
      if (data.adminCode !== ADMIN_REGISTRATION_CODE) {
        throw new Error("Invalid admin registration code");
      }

      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "admin", // Set role as admin
        isEmailVerified: true, // Auto-verify admin accounts
        adminCode: data.adminCode, // Send admin code for backend verification
      });
      return response.data;
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Admin account created! Please login.");
      navigate("/admin/login");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(err.message || err.response?.data?.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Admin Registration</h1>
            <p className="text-base-content/60 mt-2">
              Create your admin account
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
                  <User className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
                  <Mail className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 pr-10 relative"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content z-20"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 pr-10 relative"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content z-20"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Admin Code */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Admin Registration Code</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none z-10" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 relative"
                  placeholder="Enter admin code"
                  value={formData.adminCode}
                  onChange={(e) =>
                    setFormData({ ...formData, adminCode: e.target.value })
                  }
                  required
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-warning">
                  Contact system administrator for the registration code
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="divider">OR</div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-base-content/60">
              Already have an admin account?{" "}
              <Link to="/admin/login" className="link link-primary">
                Login here
              </Link>
            </p>
            <p className="text-sm text-base-content/60">
              <Link to="/" className="link link-primary">
                Back to Store
              </Link>
            </p>
          </div>

          {/* Warning */}
          <div className="alert alert-info mt-4">
            <Shield className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Admin Registration Info:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Maximum 2 super-admins can register</li>
                <li>Requires special registration code</li>
                <li>Additional admins can be promoted later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
