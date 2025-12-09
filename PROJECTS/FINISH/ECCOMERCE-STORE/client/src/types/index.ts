// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'vendor';
  avatar?: string;
  addresses?: Address[];
  wishlist?: string[];
  twoFactorEnabled?: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Category | string;
  brand?: string;
  stock: number;
  sku: string;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  tags?: string[];
  featured: boolean;
  averageRating: number;
  totalReviews: number;
  sold: number;
  views: number;
  isActive: boolean;
  vendor?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductSpecification {
  key: string;
  value: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | Category;
  isActive: boolean;
  createdAt: string;
}

// Cart types
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  variant?: string;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  updatedAt: string;
}

// Order types
export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  discount: number;
  couponCode?: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  updateTime: string;
  emailAddress?: string;
}

// Review types
export interface Review {
  _id: string;
  product: string | Product;
  user: User | string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
  userId?: string;
  twoFactorMethod?: string;
  locked?: boolean;
  remainingMinutes?: number;
  attemptsRemaining?: number;
}
