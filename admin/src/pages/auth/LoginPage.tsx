import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import logo from "../../assets/icon.png";
const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16 place-content-center flex items-center justify-center">
                <img
                  src={logo}
                  alt="Earn9ja Logo"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="card-title justify-center text-2xl font-bold mb-2">
            Earn9ja Admin
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Sign in to access the admin panel
          </p>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email or Phone</span>
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder="Enter your email or phone"
                className="input input-bordered"
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost btn-sm absolute right-0 top-0"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="divider">OR</div>
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
