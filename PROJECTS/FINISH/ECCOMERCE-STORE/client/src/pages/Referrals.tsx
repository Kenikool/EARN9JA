import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Users, Gift, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SEO from '../components/SEO';

interface Referral {
  _id: string;
  code: string;
  referrer: string;
  referred?: {
    name: string;
    email: string;
  };
  status: 'pending' | 'completed';
  reward: number;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  referrals: Referral[];
}

export default function Referrals() {
  const [copied, setCopied] = useState(false);

  // Get referral code
  const { data: referralData } = useQuery({
    queryKey: ['referral-code'],
    queryFn: async () => {
      const { data } = await api.post('/social/referral/create');
      return data.data.referral;
    },
  });

  // Get referral stats
  const { data: statsData } = useQuery<ReferralStats>({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const { data } = await api.get('/social/referral/stats');
      return data.data;
    },
  });

  const referralCode = referralData?.code;
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SEO title="Referrals - Earn Rewards" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Referral Program</h1>

        {/* Referral Code Card */}
        <div className="card bg-linear-to-r from-primary to-secondary text-primary-content mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Your Referral Code</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-4xl font-bold tracking-wider mb-2">
                  {referralCode || 'Loading...'}
                </div>
                <p className="opacity-90">
                  Share this code with friends and earn rewards!
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="btn btn-neutral btn-lg"
              >
                <Copy className="w-5 h-5 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60">Total Referrals</p>
                  <p className="text-3xl font-bold">
                    {statsData?.totalReferrals || 0}
                  </p>
                </div>
                <Users className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60">Pending</p>
                  <p className="text-3xl font-bold">
                    {statsData?.pendingReferrals || 0}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-warning" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60">Total Rewards</p>
                  <p className="text-3xl font-bold">
                    {statsData?.totalRewards || 0} pts
                  </p>
                </div>
                <Gift className="w-12 h-12 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Share Your Code</h3>
                <p className="text-sm text-base-content/60">
                  Share your unique referral code with friends and family
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-bold mb-2">They Sign Up</h3>
                <p className="text-sm text-base-content/60">
                  Your friend creates an account using your code
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">Earn Rewards</h3>
                <p className="text-sm text-base-content/60">
                  You both get 100 loyalty points as a reward!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral History */}
        {statsData?.referrals && statsData.referrals.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Referral History</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Friend</th>
                      <th>Status</th>
                      <th>Reward</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.referrals.map((referral) => (
                      <tr key={referral._id}>
                        <td>
                          {referral.referred?.name || 'Pending'}
                        </td>
                        <td>
                          <span className={`badge ${
                            referral.status === 'completed' 
                              ? 'badge-success' 
                              : 'badge-warning'
                          }`}>
                            {referral.status}
                          </span>
                        </td>
                        <td>{referral.reward} pts</td>
                        <td>
                          {new Date(referral.createdAt).toLocaleDateString()}
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
