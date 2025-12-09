import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SEO from '../components/SEO';

export default function LoyaltyPoints() {
  const [redeemAmount, setRedeemAmount] = useState('');
  const queryClient = useQueryClient();

  // Get loyalty points
  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty-points'],
    queryFn: async () => {
      const { data } = await api.get('/social/loyalty/points');
      return data.data.loyaltyPoints;
    },
  });

  // Redeem points mutation
  const redeemMutation = useMutation({
    mutationFn: async (points: number) => {
      const { data } = await api.post('/social/loyalty/redeem', {
        points,
        reason: 'Redeemed for discount',
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Points redeemed successfully!');
      queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
      setRedeemAmount('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to redeem points');
    },
  });

  const handleRedeem = () => {
    const points = parseInt(redeemAmount);
    if (isNaN(points) || points <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (points > (loyaltyData?.points || 0)) {
      toast.error('Insufficient points');
      return;
    }
    redeemMutation.mutate(points);
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'badge-info';
      case 'gold': return 'badge-warning';
      case 'silver': return 'badge-neutral';
      case 'bronze': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  return (
    <>
      <SEO title="Loyalty Points - Rewards Program" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Loyalty Points</h1>

        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-linear-to-r from-primary to-secondary text-primary-content">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-90 mb-2">Your Points</p>
                  <p className="text-5xl font-bold">
                    {loyaltyData?.points || 0}
                  </p>
                </div>
                <Award className="w-20 h-20 opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Your Tier</h3>
                <span className={`badge badge-lg ${getTierBadgeClass(loyaltyData?.tier || 'bronze')}`}>
                  {loyaltyData?.tier?.toUpperCase() || 'BRONZE'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bronze</span>
                  <span>0 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Silver</span>
                  <span>1,000 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gold</span>
                  <span>5,000 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platinum</span>
                  <span>10,000 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Points */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <Gift className="w-6 h-6" />
              Redeem Points
            </h2>
            <p className="text-base-content/60 mb-4">
              Redeem your points for discounts on your next purchase. 100 points = $1 discount
            </p>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Enter points to redeem"
                className="input input-bordered flex-1"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                min="0"
                max={loyaltyData?.points || 0}
              />
              <button
                onClick={handleRedeem}
                disabled={redeemMutation.isPending}
                className="btn btn-primary"
              >
                {redeemMutation.isPending ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
            {redeemAmount && parseInt(redeemAmount) > 0 && (
              <p className="text-sm text-base-content/60 mt-2">
                You will get ${(parseInt(redeemAmount) / 100).toFixed(2)} discount
              </p>
            )}
          </div>
        </div>

        {/* Earn Points */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Ways to Earn Points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-bold">Make a Purchase</h3>
                  <p className="text-sm text-base-content/60">
                    Earn 1 point for every $1 spent
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-bold">Refer a Friend</h3>
                  <p className="text-sm text-base-content/60">
                    Get 100 points for each referral
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-bold">Write a Review</h3>
                  <p className="text-sm text-base-content/60">
                    Earn 10 points per product review
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-bold">Share Products</h3>
                  <p className="text-sm text-base-content/60">
                    Get 5 points for sharing on social media
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        {loyaltyData?.transactions && loyaltyData.transactions.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Reason</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyData.transactions.slice().reverse().map((transaction: { type: string; points: number; reason: string; date: string }, index: number) => (
                      <tr key={index}>
                        <td>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'earned' ? (
                              <TrendingUp className="w-4 h-4 text-success" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-error" />
                            )}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td className={transaction.type === 'earned' ? 'text-success' : 'text-error'}>
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                        </td>
                        <td>{transaction.reason}</td>
                        <td>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
