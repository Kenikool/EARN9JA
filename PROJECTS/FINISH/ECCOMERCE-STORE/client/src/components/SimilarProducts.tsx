import { useQuery } from '@tanstack/react-query';
import { Layers } from 'lucide-react';
import api from '../services/api';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface SimilarProductsProps {
  productId: string;
  limit?: number;
}

export default function SimilarProducts({ productId, limit = 4 }: SimilarProductsProps) {
  const { data: similarProducts, isLoading } = useQuery({
    queryKey: ['ai-similar', productId],
    queryFn: async () => {
      const { data } = await api.get(`/ai/similar/${productId}?limit=${limit}`);
      return data.data.products || [];
    },
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-6 h-6 text-secondary" />
          <h2 className="text-2xl font-bold">Similar Products</h2>
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

  const hasProducts = similarProducts && similarProducts.length > 0;

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-6 h-6 text-secondary" />
        <h2 className="text-2xl font-bold">Similar Products</h2>
      </div>
      
      {hasProducts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-base-100 rounded-lg">
          <p className="text-base-content/60">
            No similar products found.
          </p>
        </div>
      )}
    </section>
  );
}
