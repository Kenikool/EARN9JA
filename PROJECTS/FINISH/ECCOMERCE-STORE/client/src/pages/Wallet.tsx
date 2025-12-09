import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import SEO from '../components/SEO';

interface WalletData {
  _id: string;
  balance: number;
  currency: string;
  transactions: Array<{
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    balanceAfter: number;
    date: string;
  }>;
}

export default function Wallet() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('flutterwave');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/wallet');
      return data.data.wallet as WalletData;
    },
  });

  const initializePaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; gateway: string; currency: string }) => {
      const response = await api.post('/wallet/initialize-payment', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Use normalized paymentUrl or fallback to specific gateway fields
      const paymentUrl = data.data.paymentUrl || 
                        data.data.authorizationUrl || 
                        data.data.paymentLink || 
                        data.data.link;
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else if (data.data.clientSecret) {
        // Stripe returns clientSecret - requires frontend SDK integration
        toast.error('Stripe requires additional setup. Please use Flutterwave or Paystack.');
      } else {
        toast.error('Payment initialization failed. Please try again.');
        console.error('Payment response:', data);
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: { reference: string; gateway: string }) => {
      const response = await api.post('/wallet/verify-payment', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Funds added successfully!');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      window.history.replaceState({}, '', '/wallet');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Payment verification failed');
    },
  });

  // Check for payment success from different gateways
  useEffect(() => {
    // Flutterwave returns: ?status=successful&tx_ref=WALLET-xxx&transaction_id=xxx
    const flwStatus = searchParams.get('status');
    const flwTransactionId = searchParams.get('transaction_id');
    
    // Paystack returns: ?reference=xxx&trxref=xxx
    const paystackRef = searchParams.get('trxref') || searchParams.get('reference');
    
    // Generic success parameter
    const paymentStatus = searchParams.get('payment');
    const genericRef = searchParams.get('reference');
    
    if (flwStatus === 'successful' && flwTransactionId) {
      // Flutterwave payment - verify using transaction_id
      toast.loading('Verifying payment...');
      verifyPaymentMutation.mutate({ 
        reference: flwTransactionId, 
        gateway: 'flutterwave' 
      });
    } else if (flwStatus === 'cancelled') {
      toast.error('Payment was cancelled');
      window.history.replaceState({}, '', '/wallet');
    } else if (paystackRef) {
      // Paystack payment
      toast.loading('Verifying payment...');
      verifyPaymentMutation.mutate({ 
        reference: paystackRef, 
        gateway: 'paystack' 
      });
    } else if (paymentStatus === 'success' && genericRef) {
      // Generic success
      toast.loading('Verifying payment...');
      verifyPaymentMutation.mutate({ 
        reference: genericRef, 
        gateway: selectedGateway 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleAddFunds = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    initializePaymentMutation.mutate({
      amount: value,
      gateway: selectedGateway,
      currency: selectedCurrency,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="My Wallet" description="Manage your wallet balance" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

        {/* Balance Card */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Available Balance</p>
                <h2 className="text-4xl font-bold">
                  ${wallet?.balance.toFixed(2) || '0.00'}
                </h2>
                <p className="text-xs opacity-60">{wallet?.currency || 'USD'}</p>
              </div>
              <WalletIcon className="w-16 h-16 opacity-50" />
            </div>
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => setShowAddFunds(true)}
                className="btn btn-sm bg-white text-primary hover:bg-base-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Transaction History</h2>
            
            {!wallet?.transactions || wallet.transactions.length === 0 ? (
              <p className="text-center py-8 text-base-content/60">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {wallet.transactions.slice(0, 20).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {tx.type === 'credit' ? (
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          <ArrowDownLeft className="w-5 h-5 text-success" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-error" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-base-content/60">
                          {new Date(tx.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-success' : 'text-error'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-base-content/60">
                        Balance: ${tx.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Funds to Wallet</h3>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="input input-bordered"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Currency</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="GHS">GHS - Ghanaian Cedi</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Payment Gateway</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedGateway}
                  onChange={(e) => setSelectedGateway(e.target.value)}
                >
                  <option value="flutterwave">Flutterwave (Recommended - Cards, Mobile Money, Bank)</option>
                  <option value="paystack">Paystack (Cards, Bank Transfer, USSD)</option>
                  <option value="stripe" disabled>Stripe (Requires SDK setup)</option>
                </select>
              </div>

              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="text-sm">You will be redirected to complete payment securely</span>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAddFunds(false);
                    setAmount('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddFunds}
                  disabled={initializePaymentMutation.isPending}
                >
                  {initializePaymentMutation.isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowAddFunds(false)}></div>
          </div>
        )}
      </div>
    </>
  );
}
