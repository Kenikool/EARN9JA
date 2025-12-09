import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Lock, User, UserPlus } from "lucide-react";

const RegisterPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 via-base-100 to-accent/5 p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="card bg-base-100 shadow-2xl border border-base-200">
          <div className="card-body p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform hover:rotate-6 transition-transform">
                <UserPlus className="w-10 h-10 text-secondary-content" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-base-content/70 text-lg">Join our vibrant blogging community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base">Full Name</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="input input-bordered input-lg w-full pl-12 focus:input-secondary transition-all"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base">Email Address</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="input input-bordered input-lg w-full pl-12 focus:input-secondary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base">Password</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="input input-bordered input-lg w-full pl-12 focus:input-secondary transition-all"
                    required
                    minLength={6}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">🔒 Minimum 6 characters required</span>
                </label>
              </div>

              <button
                type="submit"
                className={`btn btn-secondary btn-lg w-full gap-2 shadow-lg hover:shadow-xl transition-all ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {!loading && <UserPlus className="w-5 h-5" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="divider text-base-content/60">OR</div>

            <div className="text-center bg-base-200/50 p-4 rounded-xl">
              <p className="text-base-content/70">
                Already have an account?{" "}
                <Link to="/login" className="text-secondary hover:text-secondary-focus font-bold hover:underline transition-colors">
                  Sign in here →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
