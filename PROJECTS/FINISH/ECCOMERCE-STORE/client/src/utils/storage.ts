// Local storage utilities with type safety

export const storage = {
  // Auth tokens
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem('refreshToken', token);
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // User data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem('user');
  },

  // Cart (for guest users)
  getGuestCart: () => {
    const cart = localStorage.getItem('guestCart');
    return cart ? JSON.parse(cart) : [];
  },

  setGuestCart: (cart: any[]): void => {
    localStorage.setItem('guestCart', JSON.stringify(cart));
  },

  clearGuestCart: (): void => {
    localStorage.removeItem('guestCart');
  },

  // Recently viewed products
  getRecentlyViewed: (): string[] => {
    const viewed = localStorage.getItem('recentlyViewed');
    return viewed ? JSON.parse(viewed) : [];
  },

  addRecentlyViewed: (productId: string): void => {
    const viewed = storage.getRecentlyViewed();
    const filtered = viewed.filter(id => id !== productId);
    const updated = [productId, ...filtered].slice(0, 10); // Keep last 10
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  },

  // Theme
  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem('theme', theme);
  },

  // Clear all
  clearAll: (): void => {
    storage.clearTokens();
    storage.clearUser();
    storage.clearGuestCart();
  },
};
