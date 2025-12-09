import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  variant: string;
  price: number;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

// Cart API calls
const cartApi = {
  getCart: async (): Promise<Cart> => {
    const { data } = await api.get('/cart');
    return data.data.cart;
  },

  addToCart: async (productId: string, quantity: number = 1, variant: string = ''): Promise<Cart> => {
    const { data } = await api.post('/cart', { productId, quantity, variant });
    return data.data.cart;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    return data.data.cart;
  },

  removeFromCart: async (itemId: string): Promise<Cart> => {
    const { data } = await api.delete(`/cart/${itemId}`);
    return data.data.cart;
  },

  clearCart: async (): Promise<Cart> => {
    const { data } = await api.delete('/cart');
    return data.data.cart;
  },
};

export function useCart() {
  const queryClient = useQueryClient();

  // Get cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    retry: false,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity, variant }: { productId: string; quantity?: number; variant?: string }) =>
      cartApi.addToCart(productId, quantity, variant),
    onSuccess: (data) => {
      // Immediately update the cache with new data
      queryClient.setQueryData(['cart'], data);
      toast.success('Item added to cart!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      toast.success('Cart updated!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update cart');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      toast.success('Item removed from cart!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove item');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to clear cart');
    },
  });

  return {
    cart,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
}
