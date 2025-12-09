import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { Product } from '../types';

interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

interface Wishlist {
  items: WishlistItem[];
}

// Wishlist API calls
const wishlistApi = {
  getWishlist: async (): Promise<Wishlist> => {
    const { data } = await api.get('/user/wishlist');
    return data.data;
  },

  addToWishlist: async (productId: string): Promise<Wishlist> => {
    const { data } = await api.post('/user/wishlist', { productId });
    return data.data;
  },

  removeFromWishlist: async (productId: string): Promise<Wishlist> => {
    const { data } = await api.delete(`/user/wishlist/${productId}`);
    return data.data;
  },

  clearWishlist: async (): Promise<Wishlist> => {
    const { data } = await api.delete('/user/wishlist');
    return data.data;
  },
};

export function useWishlist() {
  const queryClient = useQueryClient();

  // Get wishlist
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    retry: false,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onSuccess: () => {
      // Refetch to get the updated wishlist with full product data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      // Refetch to get the updated wishlist
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove from wishlist');
    },
  });

  // Clear wishlist mutation
  const clearWishlistMutation = useMutation({
    mutationFn: wishlistApi.clearWishlist,
    onSuccess: (data) => {
      queryClient.setQueryData(['wishlist'], data);
      toast.success('Wishlist cleared!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to clear wishlist');
    },
  });

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return wishlist?.items?.some((item) => item.product._id === productId) || false;
  };

  // Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlist,
    isLoading,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    clearWishlist: clearWishlistMutation.mutate,
    toggleWishlist,
    isInWishlist,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
    isTogglingWishlist: addToWishlistMutation.isPending || removeFromWishlistMutation.isPending,
  };
}
