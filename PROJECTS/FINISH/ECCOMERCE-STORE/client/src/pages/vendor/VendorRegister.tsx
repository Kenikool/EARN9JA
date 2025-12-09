import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import api from "../../services/api";
import { showToast } from "../../utils/toast";
import SEO from "../../components/SEO";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    description: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post("/vendor/register", data);
      return response.data;
    },
    onSuccess: () => {
      showToast.success("Vendor registration submitted! Awaiting admin approval.");
      navigate("/vendor/dashboard");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast.error(err.response?.data?.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SEO title="Become a Vendor" description="Register as a vendor and start selling on our platform" />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card bg-base-100 border shadow-lg">
          <div className="card-body">
            <div className="text-center mb-6">
              <Store className="w-16 h-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold">Become a Vendor</h1>
              <p className="text-base-content/60 mt-2">
                Join our marketplace and start selling your products
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Name *</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Email *</span>
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Phone *</span>
                </label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24"
                  placeholder="Tell us about your business..."
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
