import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface TrendingProductsProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function TrendingProducts({ limit = 8, showViewAll = true }: TrendingProductsProps) {
  const { data: trendingProducts, isLoading } = useQuery({
    queryKey: ['ai-trending', limit],
    queryFn: async () => {
      const { data } = await api.get(`/ai/trending?limit=${limit}`);
      return data.data.products || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-8">
            <TrendingUp className="w-8 h-8 text-warning" />
            <h2 className="text-3xl font-bold text-center">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <div className="skeleton h-48 w-full"></div>
                <div className="card-body">
                  <div className="skeleton h-4 w-3/4 mb-2"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't hide the section, show a message instead
  const hasProducts = trendingProducts && trendingProducts.length > 0;

  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp className="w-8 h-8 text-warning" />
          <h2 className="text-3xl font-bold text-center">Trending Now</h2>
        </div>
        
        {hasProducts ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {showViewAll && (
              <div className="text-center mt-8">
                <Link to="/shop?sort=trending" className="btn btn-primary">
                  View All Trending Products
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-base-content/60 text-lg mb-4">
              No trending products yet. Check back soon!
            </p>
            <Link to="/shop" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
