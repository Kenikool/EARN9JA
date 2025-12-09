import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface SocialShareProps {
  productId: string;
  productName: string;
  productImage?: string;
}

export default function SocialShare({ productId, productName, productImage }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentUrl = window.location.href;

  const trackShare = async (platform: string) => {
    try {
      await api.post('/social/share', {
        productId,
        platform,
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('facebook');
    toast.success('Shared on Facebook! +5 points earned');
  };

  const shareOnTwitter = () => {
    const text = `Check out ${productName}!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('twitter');
    toast.success('Shared on Twitter! +5 points earned');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('linkedin');
    toast.success('Shared on LinkedIn! +5 points earned');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    trackShare('copy-link');
    toast.success('Link copied! +5 points earned');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline btn-sm gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
            <div className="p-2 space-y-1">
              <button
                onClick={shareOnFacebook}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-base-200 rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </button>

              <button
                onClick={shareOnTwitter}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-base-200 rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5 text-sky-500" />
                <span>Twitter</span>
              </button>

              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-base-200 rounded-lg transition-colors"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span>LinkedIn</span>
              </button>

              <div className="divider my-1"></div>

              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-base-200 rounded-lg transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
