import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Package, Pause, Play, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SEO from '../components/SEO';

interface Subscription {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextDelivery: string;
  status: 'active' | 'paused' | 'cancelled';
  quantity: number;
  price: number;
  discount: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [gateway, setGateway] = useState('flutterwave');
  const [currency, setCurrency] = useState('USD');

  // Check for payment success from different gateways
  useEffect(() => {
    // Flutterwave returns: ?status=successful&tx_ref=SUB-xxx&transaction_id=xxx
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
      window.history.replaceState({}, '', '/subscriptions');
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
        gateway 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions');
      return data.data.subscriptions as Subscription[];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-subscription'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=50');
      return data.data.products as Product[];
    },
    enabled: showCreateModal,
  });

  const initializePaymentMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      frequency: string;
      quantity: number;
      deliveryAddress: object;
      gateway: string;
      currency: string;
    }) => {
      const response = await api.post('/subscriptions/initialize-payment', data);
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
      const response = await api.post('/subscriptions/verify-payment', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Subscription created successfully!');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      navigate('/subscriptions', { replace: true });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Payment verification failed');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/subscriptions/${id}/pause`);
    },
    onSuccess: () => {
      toast.success('Subscription paused');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/subscriptions/${id}/resume`);
    },
    onSuccess: () => {
      toast.success('Subscription resumed');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/subscriptions/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success('Subscription cancelled');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const handleCreateSubscription = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const deliveryAddress = {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      country: 'Country',
      zipCode: '12345',
    };

    initializePaymentMutation.mutate({
      productId: selectedProduct._id,
      frequency,
      quantity,
      deliveryAddress,
      gateway,
      currency,
    });
  };

  const getFrequencyText = (freq: string) => {
    switch(freq) {
      case 'weekly': return 'Every Week';
      case 'biweekly': return 'Every 2 Weeks';
      case 'monthly': return 'Every Month';
      default: return freq;
    }
  };

  const calculateSubscriptionPrice = (price: number, qty: number) => {
    return price * qty * 0.9; // 10% discount
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
      <SEO title="My Subscriptions" description="Manage your product subscriptions" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Subscription
          </button>
        </div>

        {!subscriptions || subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
            <p className="text-base-content/60 mb-4">No active subscriptions</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Your First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <div key={sub._id} className="card bg-base-100 shadow-xl">
                <figure className="h-48">
                  <img
                    src={sub.product.images?.[0] || '/placeholder.png'}
                    alt={sub.product.name}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{sub.product.name}</h2>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{getFrequencyText(sub.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Quantity: {sub.quantity}</span>
                    </div>
                    <div>
                      <span className="font-bold">${(sub.price * (1 - sub.discount / 100)).toFixed(2)}</span>
                      {sub.discount > 0 && (
                        <span className="text-xs text-success ml-2">({sub.discount}% off)</span>
                      )}
                    </div>
                    <div>
                      Next delivery: {new Date(sub.nextDelivery).toLocaleDateString()}
                    </div>
                    <div>
                      <span className={`badge ${
                        sub.status === 'active' ? 'badge-success' :
                        sub.status === 'paused' ? 'badge-warning' :
                        'badge-neutral'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    {sub.status === 'active' && (
                      <button
                        onClick={() => pauseMutation.mutate(sub._id)}
                        className="btn btn-sm btn-warning"
                        disabled={pauseMutation.isPending}
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {sub.status === 'paused' && (
                      <button
                        onClick={() => resumeMutation.mutate(sub._id)}
                        className="btn btn-sm btn-success"
                        disabled={resumeMutation.isPending}
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {sub.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm('Cancel this subscription?')) {
                            cancelMutation.mutate(sub._id);
                          }
                        }}
                        className="btn btn-sm btn-error"
                        disabled={cancelMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Subscription Modal */}
        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Create New Subscription</h3>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Select Product</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedProduct?._id || ''}
                  onChange={(e) => {
                    const product = products?.find(p => p._id === e.target.value);
                    setSelectedProduct(product || null);
                  }}
                >
                  <option value="">Choose a product</option>
                  {products?.map((product: Product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Delivery Frequency</span>
                </label>
                <select
                  className="select select-bordered"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly')}
                >
                  <option value="weekly">Weekly (10% off)</option>
                  <option value="biweekly">Bi-weekly (10% off)</option>
                  <option value="monthly">Monthly (10% off)</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Currency</span>
                </label>
                <select
                  className="select select-bordered"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                >
                  <option value="flutterwave">Flutterwave (Recommended - Cards, Mobile Money, Bank)</option>
                  <option value="paystack">Paystack (Cards, Bank Transfer, USSD)</option>
                  <option value="stripe" disabled>Stripe (Requires SDK setup)</option>
                </select>
              </div>

              {selectedProduct && (
                <div className="alert alert-success mb-4">
                  <div>
                    <div className="font-bold">Subscription Price</div>
                    <div className="text-sm">
                      Original: ${(selectedProduct.price * quantity).toFixed(2)} per delivery
                    </div>
                    <div className="text-sm">
                      With 10% discount: ${calculateSubscriptionPrice(selectedProduct.price, quantity).toFixed(2)} per delivery
                    </div>
                    <div className="text-xs mt-2 opacity-70">
                      You save ${(selectedProduct.price * quantity * 0.1).toFixed(2)} on each delivery!
                    </div>
                  </div>
                </div>
              )}

              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="text-sm">You will be charged for the first delivery now. Future deliveries will be processed automatically.</span>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateSubscription}
                  disabled={!selectedProduct || initializePaymentMutation.isPending}
                >
                  {initializePaymentMutation.isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}></div>
          </div>
        )}
      </div>
    </>
  );
}
