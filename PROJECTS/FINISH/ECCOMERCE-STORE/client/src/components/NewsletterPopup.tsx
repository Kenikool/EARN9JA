import { useState, useEffect } from 'react';
import { X, Mail, Gift } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Check if user has already subscribed or dismissed
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');
    const hasDismissed = localStorage.getItem('newsletter_dismissed');
    
    if (!hasSubscribed && !hasDismissed) {
      // Show popup after 10 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/social/newsletter/subscribe', { email });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('newsletter_subscribed', 'true');
      setIsOpen(false);
      toast.success(`Subscribed successfully! ${data.data.pointsEarned > 0 ? `+${data.data.pointsEarned} points earned` : ''}`);
    },
    onError: () => {
      toast.error('Failed to subscribe. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    subscribeMutation.mutate(email);
  };

  const handleDismiss = () => {
    localStorage.setItem('newsletter_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Popup */}
        <div className="bg-base-100 rounded-lg shadow-2xl max-w-md w-full relative animate-fade-in">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2">
              Get 10% Off Your First Order!
            </h2>
            <p className="text-center text-base-content/60 mb-6">
              Subscribe to our newsletter and get exclusive deals, new arrivals, and 10 loyalty points!
            </p>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-success" />
                <span>Exclusive discounts and offers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-success" />
                <span>Early access to sales</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-success" />
                <span>10 loyalty points instantly</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="btn btn-primary w-full"
              >
                {subscribeMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>

            {/* Privacy Note */}
            <p className="text-xs text-center text-base-content/40 mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
