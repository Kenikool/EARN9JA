import { useQuery } from '@tanstack/react-query';
import { Clock, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

export default function FlashSales() {
  const { data: flashSalesData, isLoading } = useQuery({
    queryKey: ['flash-sales'],
    queryFn: async () => {
      const { data } = await api.get('/social/flash-sales');
      return data.data.flashSales;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const getTimeRemaining = (endTime: string) => {
    const total = Date.parse(endTime) - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
  };

  const CountdownTimer = ({ endTime }: { endTime: string }) => {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime));

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(getTimeRemaining(endTime));
      }, 1000);

      return () => clearInterval(timer);
    }, [endTime]);

    if (timeLeft.total <= 0) {
      return <span className="text-error">Ended</span>;
    }

    return (
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{timeLeft.days}</span>
            <span className="text-xs">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.hours}</span>
          <span className="text-xs">Hours</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.minutes}</span>
          <span className="text-xs">Mins</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.seconds}</span>
          <span className="text-xs">Secs</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Flash Sales - Limited Time Offers" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-10 h-10 text-warning" />
          <div>
            <h1 className="text-4xl font-bold">Flash Sales</h1>
            <p className="text-base-content/60">Limited time offers - Grab them before they're gone!</p>
          </div>
        </div>

        {/* Flash Sales Grid */}
        {flashSalesData && flashSalesData.length > 0 ? (
          <div className="space-y-8">
            {flashSalesData.map((sale: unknown) => (
              <div key={sale._id} className="card bg-base-100 shadow-xl border-2 border-warning">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-6 h-6 text-warning" />
                        <h2 className="text-2xl font-bold">
                          {sale.discountPercentage}% OFF
                        </h2>
                      </div>
                      <p className="text-base-content/60">
                        {sale.quantity - sale.soldCount} of {sale.quantity} remaining
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-error" />
                      <CountdownTimer endTime={sale.endTime} />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sold: {sale.soldCount}</span>
                      <span>{Math.round((sale.soldCount / sale.quantity) * 100)}%</span>
                    </div>
                    <progress 
                      className="progress progress-warning w-full" 
                      value={sale.soldCount} 
                      max={sale.quantity}
                    ></progress>
                  </div>

                  {/* Product */}
                  {sale.product && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-1">
                        <ProductCard product={sale.product} />
                      </div>
                      <div className="md:col-span-3 flex items-center">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{sale.product.name}</h3>
                          <p className="text-base-content/60 mb-4">{sale.product.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-success">
                              ${(sale.product.price * (1 - sale.discountPercentage / 100)).toFixed(2)}
                            </span>
                            <span className="text-xl line-through text-base-content/40">
                              ${sale.product.price}
                            </span>
                            <span className="badge badge-warning badge-lg">
                              Save ${(sale.product.price * sale.discountPercentage / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Zap className="w-20 h-20 text-base-content/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Active Flash Sales</h2>
            <p className="text-base-content/60 mb-6">
              Check back soon for amazing deals!
            </p>
            <a href="/shop" className="btn btn-primary">
              Browse All Products
            </a>
          </div>
        )}
      </div>
    </>
  );
}
