import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import api from '../services/api';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface RecommendedProductsProps {
  userId?: string;
  limit?: number;
}

export default function RecommendedProducts({ userId, limit = 4 }: RecommendedProductsProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-recommendations', userId],
    queryFn: async () => {
      const endpoint = userId 
        ? `/ai/recommendations?limit=${limit}`
        : `/ai/trending?limit=${limit}`;
      const { data } = await api.get(endpoint);
      return data.data.products || [];
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {userId ? 'Recommended for You' : 'Trending Now'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <div className="skeleton h-48 w-full"></div>
              <div className="card-body">
                <div className="skeleton h-4 w-3/4 mb-2"></div>
                <div className="skeleton h-4 w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">
          {userId ? 'Recommended for You' : 'Trending Now'}
        </h2>
      </div>
      
      {hasRecommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-base-100 rounded-lg">
          <p className="text-base-content/60">
            {userId 
              ? 'Start shopping to get personalized recommendations!' 
              : 'No recommendations available yet.'}
          </p>
        </div>
      )}
    </section>
  );
}
