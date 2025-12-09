import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Send,
  Download,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
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
    reference?: string;
  }>;
}

type PaymentStep = 'idle' | 'initializing' | 'redirecting' | 'processing' | 'verifying' | 'completed' | 'failed';

export default function WalletPro() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('flutterwave');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [selectedTransaction, setSelectedTransaction] = useState<WalletData['transactions'][0] | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    country: 'US',
  });

  const { data: wallet, isLoading, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      console.log('Fetching wallet data...');
      const { data } = await api.get('/wallet');
      console.log('Wallet data received:', data.data.wallet);
      return data.data.wallet as WalletData;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const initializePaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; gateway: string; currency: string }) => {
      setPaymentStep('initializing');
      const response = await api.post('/wallet/initialize-payment', data);
      return response.data;
    },
    onSuccess: (data) => {
      setPaymentStep('redirecting');
      const paymentUrl = data.data.paymentUrl || 
                        data.data.authorizationUrl || 
                        data.data.paymentLink || 
                        data.data.link;
      
      if (paymentUrl) {
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 1000);
      } else if (data.data.clientSecret) {
        toast.error('Stripe requires additional setup. Please use Flutterwave or Paystack.');
        setPaymentStep('failed');
      } else {
        toast.error('Payment initialization failed. Please try again.');
        setPaymentStep('failed');
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
      setPaymentStep('failed');
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: { reference: string; gateway: string }) => {
      console.log('Verifying payment:', data);
      setPaymentStep('verifying');
      const response = await api.post('/wallet/verify-payment', data);
      console.log('Verification response:', response.data);
      return response.data;
    },
    onSuccess: async (data) => {
      console.log('Payment verified successfully:', data);
      toast.dismiss('verify-payment');
      setPaymentStep('completed');
      toast.success('Funds added successfully! 🎉', { duration: 3000 });
      
      // Force refetch wallet data
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await refetch();
      
      setTimeout(() => {
        window.history.replaceState({}, '', '/wallet');
        setPaymentStep('idle');
      }, 3000);
    },
    onError: (error: unknown) => {
      console.error('Payment verification error:', error);
      toast.dismiss('verify-payment');
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Payment verification failed');
      setPaymentStep('failed');
      setTimeout(() => {
        window.history.replaceState({}, '', '/wallet');
        setPaymentStep('idle');
      }, 3000);
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { recipientEmail: string; amount: number }) => {
      const response = await api.post('/wallet/transfer', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Transfer successful!');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setShowTransfer(false);
      setRecipientEmail('');
      setAmount('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Transfer failed');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; bankDetails: typeof bankDetails }) => {
      const response = await api.post('/wallet/withdraw', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Withdrawal request submitted!');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setShowWithdraw(false);
      setAmount('');
      setBankDetails({
        accountName: '',
        accountNumber: '',
        bankName: '',
        country: 'US',
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    },
  });

  // Check for payment success from different gateways
  useEffect(() => {
    const flwStatus = searchParams.get('status');
    const flwTransactionId = searchParams.get('transaction_id');
    const paystackRef = searchParams.get('trxref') || searchParams.get('reference');
    const paymentStatus = searchParams.get('payment');
    const genericRef = searchParams.get('reference');
    
    // Debug logging
    console.log('Payment return detected:', {
      flwStatus,
      flwTransactionId,
      paystackRef,
      paymentStatus,
      genericRef,
      fullURL: window.location.href
    });
    
    if (flwStatus === 'successful' && flwTransactionId) {
      console.log('Flutterwave payment detected, verifying...');
      setPaymentStep('processing');
      toast.loading('Verifying payment...', { id: 'verify-payment' });
      verifyPaymentMutation.mutate({ 
        reference: flwTransactionId, 
        gateway: 'flutterwave' 
      });
    } else if (flwStatus === 'cancelled') {
      console.log('Payment was cancelled');
      toast.error('Payment was cancelled');
      setPaymentStep('failed');
      setTimeout(() => {
        window.history.replaceState({}, '', '/wallet');
        setPaymentStep('idle');
      }, 2000);
    } else if (paystackRef) {
      console.log('Paystack payment detected, verifying...');
      setPaymentStep('processing');
      toast.loading('Verifying payment...', { id: 'verify-payment' });
      verifyPaymentMutation.mutate({ 
        reference: paystackRef, 
        gateway: 'paystack' 
      });
    } else if (paymentStatus === 'success' && genericRef) {
      console.log('Generic payment detected, verifying...');
      setPaymentStep('processing');
      toast.loading('Verifying payment...', { id: 'verify-payment' });
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
    if (value < 1) {
      toast.error('Minimum amount is $1');
      return;
    }
    initializePaymentMutation.mutate({
      amount: value,
      gateway: selectedGateway,
      currency: selectedCurrency,
    });
  };

  const handleTransfer = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }
    if (wallet && value > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    transferMutation.mutate({
      recipientEmail,
      amount: value,
    });
  };

  const handleWithdraw = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (value < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }
    if (!bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.accountName) {
      toast.error('Please fill in all bank details');
      return;
    }
    if (wallet && value > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    withdrawMutation.mutate({
      amount: value,
      bankDetails,
    });
  };

  const downloadReceipt = (transaction: WalletData['transactions'][0]) => {
    const receipt = `
TRANSACTION RECEIPT
==================
Date: ${new Date(transaction.date).toLocaleString()}
Type: ${transaction.type.toUpperCase()}
Amount: $${transaction.amount.toFixed(2)}
Description: ${transaction.description}
Reference: ${transaction.reference || 'N/A'}
Balance After: $${transaction.balanceAfter.toFixed(2)}
==================
    `.trim();
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStepStatus = (step: string) => {
    const steps = ['initializing', 'redirecting', 'processing', 'verifying', 'completed'];
    const currentIndex = steps.indexOf(paymentStep);
    const stepIndex = steps.indexOf(step);
    
    if (paymentStep === 'failed') return 'error';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (isLoading || paymentStep === 'processing' || paymentStep === 'verifying') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-base-content/60 mb-2">
              {isLoading && 'Loading wallet...'}
              {paymentStep === 'processing' && 'Processing payment...'}
              {paymentStep === 'verifying' && 'Verifying payment...'}
            </p>
            {(paymentStep === 'processing' || paymentStep === 'verifying') && (
              <p className="text-sm text-base-content/40">Please wait, this may take a few seconds</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalIncome = wallet?.transactions
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0) || 0;
  
  const totalExpense = wallet?.transactions
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0) || 0;

  return (
    <>
      <SEO title="My Wallet" description="Manage your wallet balance and transactions" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-base-content/60">Manage your funds securely</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">
              <Shield className="w-4 h-4 mr-2" />
              Secure
            </button>
          </div>
        </div>

        {/* Payment Progress Modal */}
        {paymentStep !== 'idle' && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-6">Payment Progress</h3>
              
              <div className="space-y-6">
                {/* Progress Steps */}
                <div className="flex justify-between items-center">
                  {[
                    { step: 'initializing', label: 'Initializing', icon: Clock },
                    { step: 'redirecting', label: 'Redirecting', icon: ArrowUpRight },
                    { step: 'processing', label: 'Processing', icon: Loader },
                    { step: 'verifying', label: 'Verifying', icon: Shield },
                    { step: 'completed', label: 'Completed', icon: CheckCircle },
                  ].map(({ step, label, icon: Icon }, index) => {
                    const status = getStepStatus(step as PaymentStep);
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center mb-2
                          ${status === 'completed' ? 'bg-success text-success-content' : ''}
                          ${status === 'active' ? 'bg-primary text-primary-content animate-pulse' : ''}
                          ${status === 'pending' ? 'bg-base-300 text-base-content/40' : ''}
                          ${status === 'error' ? 'bg-error text-error-content' : ''}
                        `}>
                          {status === 'active' && step === 'processing' ? (
                            <Loader className="w-6 h-6 animate-spin" />
                          ) : status === 'error' ? (
                            <XCircle className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <p className={`text-xs text-center ${
                          status === 'active' ? 'font-bold' : ''
                        }`}>
                          {label}
                        </p>
                        {index < 4 && (
                          <div className={`h-1 w-full mt-2 ${
                            status === 'completed' ? 'bg-success' : 'bg-base-300'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status Message */}
                <div className="alert">
                  <div>
                    {paymentStep === 'initializing' && (
                      <p>Setting up your payment...</p>
                    )}
                    {paymentStep === 'redirecting' && (
                      <p>Redirecting to payment gateway...</p>
                    )}
                    {paymentStep === 'processing' && (
                      <p>Processing your payment...</p>
                    )}
                    {paymentStep === 'verifying' && (
                      <p>Verifying payment and adding funds...</p>
                    )}
                    {paymentStep === 'completed' && (
                      <p className="text-success">✓ Payment successful! Funds added to your wallet.</p>
                    )}
                    {paymentStep === 'failed' && (
                      <p className="text-error">✗ Payment failed. Please try again.</p>
                    )}
                  </div>
                </div>

                {(paymentStep === 'completed' || paymentStep === 'failed') && (
                  <button
                    className="btn btn-block"
                    onClick={() => {
                      setPaymentStep('idle');
                      window.history.replaceState({}, '', '/wallet');
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balance & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-80 mb-1">Available Balance</p>
                    <h2 className="text-5xl font-bold mb-2">
                      ${wallet?.balance.toFixed(2) || '0.00'}
                    </h2>
                    <p className="text-xs opacity-60">{wallet?.currency || 'USD'}</p>
                  </div>
                  <WalletIcon className="w-16 h-16 opacity-30" />
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 mt-6">
                  <button
                    onClick={() => setShowAddFunds(true)}
                    className="btn btn-sm bg-white/20 hover:bg-white/30 border-0 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                  <button
                    onClick={() => setShowTransfer(true)}
                    className="btn btn-sm bg-white/20 hover:bg-white/30 border-0 text-white"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </button>
                  <button
                    onClick={() => setShowWithdraw(true)}
                    className="btn btn-sm bg-white/20 hover:bg-white/30 border-0 text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Recent Transactions</h2>
                  <button className="btn btn-ghost btn-sm">View All</button>
                </div>
                
                {!wallet?.transactions || wallet.transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                      <WalletIcon className="w-8 h-8 text-base-content/30" />
                    </div>
                    <p className="text-base-content/60 mb-4">No transactions yet</p>
                    <button
                      onClick={() => setShowAddFunds(true)}
                      className="btn btn-primary btn-sm"
                    >
                      Add Funds to Get Started
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wallet.transactions.slice(0, 10).map((tx) => (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 hover:bg-base-200 rounded-lg cursor-pointer transition-colors"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tx.type === 'credit' ? 'bg-success/20' : 'bg-error/20'
                          }`}>
                            {tx.type === 'credit' ? (
                              <ArrowDownLeft className={`w-6 h-6 text-success`} />
                            ) : (
                              <ArrowUpRight className={`w-6 h-6 text-error`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-xs text-base-content/60">
                              {new Date(tx.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            tx.type === 'credit' ? 'text-success' : 'text-error'
                          }`}>
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
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="font-bold mb-4">Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-5 h-5 text-success" />
                      <span className="text-sm">Total Income</span>
                    </div>
                    <span className="font-bold text-success">${totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-error" />
                      <span className="text-sm">Total Expense</span>
                    </div>
                    <span className="font-bold text-error">${totalExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm">Net Flow</span>
                    </div>
                    <span className="font-bold text-primary">
                      ${(totalIncome - totalExpense).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  Security
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>256-bit encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>2FA enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md">
              <h3 className="font-bold text-lg mb-4">Add Funds to Wallet</h3>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input input-bordered w-full pl-8 text-lg"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt">Minimum: $1.00</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Currency</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="USD">🇺🇸 USD - US Dollar</option>
                    <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
                    <option value="GHS">🇬🇭 GHS - Ghanaian Cedi</option>
                    <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                    <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
                    <option value="EUR">🇪🇺 EUR - Euro</option>
                    <option value="GBP">🇬🇧 GBP - British Pound</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Payment Method</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={selectedGateway}
                    onChange={(e) => setSelectedGateway(e.target.value)}
                  >
                    <option value="flutterwave">
                      Flutterwave (Cards, Mobile Money, Bank Transfer)
                    </option>
                    <option value="paystack">
                      Paystack (Cards, Bank Transfer, USSD)
                    </option>
                  </select>
                </div>

                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-sm">
                    <p className="font-bold">Secure Payment</p>
                    <p>You'll be redirected to complete payment securely</p>
                  </div>
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAddFunds(false);
                    setAmount('');
                  }}
                  disabled={initializePaymentMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddFunds}
                  disabled={initializePaymentMutation.isPending}
                >
                  {initializePaymentMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => !initializePaymentMutation.isPending && setShowAddFunds(false)}></div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransfer && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md">
              <h3 className="font-bold text-lg mb-4">Send Money</h3>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Recipient Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    className="input input-bordered"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input input-bordered w-full pl-8 text-lg"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt">
                      Available: ${wallet?.balance.toFixed(2) || '0.00'}
                    </span>
                  </label>
                </div>

                <div className="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm">Make sure the recipient email is correct. This action cannot be undone.</span>
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowTransfer(false);
                    setRecipientEmail('');
                    setAmount('');
                  }}
                  disabled={transferMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleTransfer}
                  disabled={transferMutation.isPending}
                >
                  {transferMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Money
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => !transferMutation.isPending && setShowTransfer(false)}></div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md">
              <h3 className="font-bold text-lg mb-4">Withdraw to Bank Account</h3>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input input-bordered w-full pl-8 text-lg"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="10"
                      step="0.01"
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt">
                      Minimum: $10.00 | Available: ${wallet?.balance.toFixed(2) || '0.00'}
                    </span>
                  </label>
                </div>

                <div className="divider">Bank Details</div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Account Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Account Number</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="input input-bordered"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Bank Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Bank of America"
                    className="input input-bordered"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Country</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={bankDetails.country}
                    onChange={(e) => setBankDetails({...bankDetails, country: e.target.value})}
                  >
                    <option value="US">🇺🇸 United States</option>
                    <option value="NG">🇳🇬 Nigeria</option>
                    <option value="GH">🇬🇭 Ghana</option>
                    <option value="KE">🇰🇪 Kenya</option>
                    <option value="ZA">🇿🇦 South Africa</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                  </select>
                </div>

                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-sm">
                    <p className="font-bold">Processing Time</p>
                    <p>Withdrawals are processed within 1-3 business days</p>
                  </div>
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowWithdraw(false);
                    setAmount('');
                  }}
                  disabled={withdrawMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Request Withdrawal
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => !withdrawMutation.isPending && setShowWithdraw(false)}></div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Transaction Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center py-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    selectedTransaction.type === 'credit' ? 'bg-success/20' : 'bg-error/20'
                  }`}>
                    {selectedTransaction.type === 'credit' ? (
                      <ArrowDownLeft className="w-10 h-10 text-success" />
                    ) : (
                      <ArrowUpRight className="w-10 h-10 text-error" />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className={`text-4xl font-bold ${
                    selectedTransaction.type === 'credit' ? 'text-success' : 'text-error'
                  }`}>
                    {selectedTransaction.type === 'credit' ? '+' : '-'}${selectedTransaction.amount.toFixed(2)}
                  </p>
                  <p className="text-base-content/60 mt-2">{selectedTransaction.description}</p>
                </div>

                <div className="divider"></div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Date</span>
                    <span className="font-medium">{new Date(selectedTransaction.date).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Type</span>
                    <span className="font-medium capitalize">{selectedTransaction.type}</span>
                  </div>
                  {selectedTransaction.reference && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Reference</span>
                      <span className="font-medium text-xs">{selectedTransaction.reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Balance After</span>
                    <span className="font-medium">${selectedTransaction.balanceAfter.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="btn btn-outline btn-block"
                  onClick={() => downloadReceipt(selectedTransaction)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </button>
              </div>

              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setSelectedTransaction(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setSelectedTransaction(null)}></div>
          </div>
        )}
      </div>
    </>
  );
}
