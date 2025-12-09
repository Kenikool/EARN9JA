import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import api from '../services/api';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    isActive: boolean;
    slug: string;
  };
  quantity: number;
  variant?: string;
  price: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface CartStore {
  // State
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;

  // Actions
  setCart: (cart: Cart | null) => void;
  setLoading: (loading: boolean) => void;
  setCartOpen: (open: boolean) => void;

  // Cart operations
  addToCart: (productId: string, quantity?: number, variant?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;

  // Computed values
  getItemCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      isOpen: false,

      // Basic setters
      setCart: (cart: Cart | null) => set({ cart }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setCartOpen: (open: boolean) => set({ isOpen: open }),

      // Load cart from API
      loadCart: async () => {
        try {
          const { data } = await api.get('/cart');
          set({ cart: data.data.cart });
        } catch (error) {
          console.error('Failed to load cart:', error);
          // Keep local cart if API fails
        }
      },

      // Cart operations with API calls
      addToCart: async (productId: string, quantity: number = 1, variant: string = '') => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/cart', { productId, quantity, variant });
          set({ cart: data.data.cart });
          toast.success('Item added to cart!');
        } catch (error: any) {
          console.error('Failed to add to cart:', error);
          toast.error(error.response?.data?.message || 'Failed to add item to cart');
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const { data } = await api.put(`/cart/${itemId}`, { quantity });
          set({ cart: data.data.cart });
          toast.success('Cart updated!');
        } catch (error: any) {
          console.error('Failed to update cart item:', error);
          toast.error(error.response?.data?.message || 'Failed to update cart');
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (itemId: string) => {
        set({ isLoading: true });
        try {
          const { data } = await api.delete(`/cart/${itemId}`);
          set({ cart: data.data.cart });
          toast.success('Item removed from cart!');
        } catch (error: any) {
          console.error('Failed to remove from cart:', error);
          toast.error(error.response?.data?.message || 'Failed to remove item');
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.delete('/cart');
          set({ cart: data.data.cart });
          toast.success('Cart cleared!');
        } catch (error: any) {
          console.error('Failed to clear cart:', error);
          toast.error(error.response?.data?.message || 'Failed to clear cart');
        } finally {
          set({ isLoading: false });
        }
      },

      // Computed values
      getItemCount: () => {
        const cart = get().cart;
        return cart?.totalItems || 0;
      },

      getTotalPrice: () => {
        const cart = get().cart;
        return cart?.subtotal || 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
        isOpen: state.isOpen,
      }),
    }
  )
);