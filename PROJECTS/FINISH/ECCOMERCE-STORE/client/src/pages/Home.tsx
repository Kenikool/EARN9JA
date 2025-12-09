import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Zap, Clock } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import RecommendedProducts from '../components/RecommendedProducts';
import TrendingProducts from '../components/TrendingProducts';
import { useAuth } from '../hooks/useAuth';
import type { Product, Category } from '../types';

// Hero Section Component
function HeroSection() {
  return (
    <section className="hero min-h-[60vh] bg-linear-to-r from-primary to-secondary text-primary-content">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-5">Welcome to E-Store</h1>
          <p className="mb-5 text-lg">
            Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, secure delivery.
          </p>
          <Link to="/shop" className="btn btn-neutral btn-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

// Flash Sales Component
function FlashSalesSection() {
  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['home-flash-sales'],
    queryFn: async () => {
      const { data } = await api.get('/social/flash-sales');
      return data.data.flashSales;
    },
  });

  if (isLoading || !flashSales || flashSales.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-warning/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-warning" />
            <h2 className="text-3xl font-bold">Flash Sales</h2>
          </div>
          <Link to="/flash-sales" className="btn btn-warning btn-sm gap-2">
            <Clock className="w-4 h-4" />
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSales.slice(0, 4).map((sale: { _id: string; discountPercentage: number; product: Product }) => (
            <div key={sale._id} className="card bg-base-100 shadow-xl border-2 border-warning">
              <div className="badge badge-warning absolute top-2 right-2 z-10">
                -{sale.discountPercentage}%
              </div>
              {sale.product && <ProductCard product={sale.product} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Products Component
function FeaturedProducts() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured');
      return data.data.products;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(featuredProducts) && featuredProducts.slice(0, 4).map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/shop" className="btn btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

// Categories Grid Component
function CategoriesGrid() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data.categories;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-lg">
                <div className="skeleton h-24 w-full"></div>
                <div className="card-body p-4">
                  <div className="skeleton h-4 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.isArray(categories) && categories.slice(0, 6).map((category: Category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.slug}`}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <figure className="h-24 bg-base-200">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
              </figure>
              <div className="card-body p-4">
                <h3 className="card-title text-sm text-center justify-center">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Best Sellers Component
function BestSellers() {
  const { data: bestSellers, isLoading } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/products?sort=-sold&limit=4');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Best Sellers</h2>
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Best Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers?.products && Array.isArray(bestSellers.products) && bestSellers.products.slice(0, 4).map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <SEO 
        title="Home - Shop Quality Products Online"
        description="Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, secure delivery."
        keywords="ecommerce, online shopping, products, deals, best sellers"
      />
      <div>
        <HeroSection />
        
        {/* Flash Sales */}
        <FlashSalesSection />
        
        {/* AI-Powered Recommendations */}
        {user && (
          <div className="container mx-auto px-4">
            <RecommendedProducts userId={user._id} limit={4} />
          </div>
        )}
        
        <FeaturedProducts />
        <CategoriesGrid />
        
        {/* AI-Powered Trending Products */}
        <TrendingProducts limit={8} />
        
        <BestSellers />
      </div>
    </>
  );
}
