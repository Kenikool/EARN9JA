import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Plus } from "lucide-react";
import api from "../../services/api";
import SEO from "../../components/SEO";
import LoadingSpinner from "../../components/LoadingSpinner";
import { showToast } from "../../utils/toast";

export default function VendorPayouts() {
  const queryClient = useQueryClient();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-payouts"],
    queryFn: async () => {
      const response = await api.get("/vendor/payouts");
      return response.data.data.payouts;
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string }) => {
      const response = await api.post("/vendor/payout/request", data);
      return response.data;
    },
    onSuccess: () => {
      showToast.success("Payout request submitted successfully");
      setShowRequestModal(false);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast.error(err.response?.data?.message || "Request failed");
    },
  });

  const handleRequest = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast.error("Please enter a valid amount");
      return;
    }
    requestMutation.mutate({ amount: amountNum, paymentMethod });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  return (
    <>
      <SEO title="Payouts - Vendor" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payouts</h1>
            <p className="text-base-content/60">
              Request and track your payouts
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Payout
          </button>
        </div>

        {data && data.length > 0 ? (
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Transaction ID</th>
                      <th>Requested</th>
                      <th>Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((payout: { _id: string; amount: number; paymentMethod?: string; status: string; transactionId?: string; createdAt: string; processedAt?: string }) => (
                      <tr key={payout._id}>
                        <td className="font-semibold">${payout.amount.toFixed(2)}</td>
                        <td className="capitalize">{payout.paymentMethod?.replace("_", " ")}</td>
                        <td>
                          <span className={`badge ${
                            payout.status === "completed" ? "badge-success" :
                            payout.status === "processing" ? "badge-info" :
                            payout.status === "failed" ? "badge-error" :
                            "badge-warning"
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="font-mono text-sm">
                          {payout.transactionId || "N/A"}
                        </td>
                        <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                        <td>
                          {payout.processedAt
                            ? new Date(payout.processedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
              <h3 className="text-xl font-semibold mb-2">No payouts yet</h3>
              <p className="text-base-content/60 mb-4">
                Request your first payout when you have earnings
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Request Payout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Request Payout</h3>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input input-bordered"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Payment Method</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select select-bordered"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="flutterwave">Flutterwave</option>
                <option value="paystack">Paystack</option>
              </select>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setShowRequestModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="btn btn-primary"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowRequestModal(false)} />
        </div>
      )}
    </>
  );
}
