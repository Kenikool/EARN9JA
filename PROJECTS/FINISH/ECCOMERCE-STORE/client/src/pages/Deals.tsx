import { useQuery } from '@tanstack/react-query';
import { Tag, Copy, Calendar, Percent, DollarSign, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SEO from '../components/SEO';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export default function Deals() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch active coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['active-coupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons/active');
      return data.data.coupons as Coupon[];
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`;
  };

  const getRemainingUses = (coupon: Coupon) => {
    if (coupon.usageLimit === 0) return 'Unlimited';
    const remaining = coupon.usageLimit - coupon.usedCount;
    return `${remaining} left`;
  };

  const isExpiringSoon = (expiresAt: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 3;
  };

  return (
    <>
      <SEO 
        title="Deals & Coupons - Save on Your Purchase"
        description="Browse active coupon codes and special deals. Save money on your next order!"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🎉 Deals & Coupons</h1>
          <p className="text-lg text-base-content/70">
            Save money with our exclusive coupon codes!
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="skeleton h-8 w-3/4 mb-4"></div>
                  <div className="skeleton h-4 w-full mb-2"></div>
                  <div className="skeleton h-4 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coupons Grid */}
        {!isLoading && coupons && coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border-2 border-primary/20"
              >
                <div className="card-body">
                  {/* Discount Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="badge badge-primary badge-lg gap-2">
                      {coupon.discountType === 'percentage' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      {getDiscountText(coupon)}
                    </div>
                    {isExpiringSoon(coupon.expiresAt) && (
                      <div className="badge badge-warning badge-sm">
                        Expiring Soon!
                      </div>
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div className="bg-base-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-base-content/60 mb-1">
                          Coupon Code
                        </p>
                        <p className="text-2xl font-bold font-mono tracking-wider">
                          {coupon.code}
                        </p>
                      </div>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="btn btn-circle btn-sm btn-primary"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {coupon.minPurchase > 0 && (
                      <div className="flex items-center gap-2 text-base-content/70">
                        <Tag className="w-4 h-4" />
                        <span>Min. order: ${coupon.minPurchase}</span>
                      </div>
                    )}
                    {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                      <div className="flex items-center gap-2 text-base-content/70">
                        <DollarSign className="w-4 h-4" />
                        <span>Max discount: ${coupon.maxDiscount}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Tag className="w-4 h-4" />
                      <span>{getRemainingUses(coupon)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="btn btn-primary btn-block"
                    >
                      {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-16">
              <Tag className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <h3 className="text-2xl font-bold mb-2">No Active Coupons</h3>
              <p className="text-base-content/60">
                Check back later for new deals and discounts!
              </p>
            </div>
          )
        )}

        {/* How to Use Section */}
        <div className="mt-16 card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">How to Use Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Copy Code</h3>
                <p className="text-sm text-base-content/70">
                  Click on any coupon to copy the code
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-bold mb-2">Shop</h3>
                <p className="text-sm text-base-content/70">
                  Add items to cart and proceed to checkout
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">Apply & Save</h3>
                <p className="text-sm text-base-content/70">
                  Paste the code at checkout and enjoy your discount!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
