export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  isUpcoming?: boolean;
  isOutOfStock?: boolean; // NEW FIELD
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  role: 'customer' | 'admin';
  email: string;
  address?: string;
  profilePic?: string;
  token?: string; // JWT Token
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: CartItem[] | any[]; // relaxed type for API flexibility
  customerId?: string;
  customerName?: string;
}

export enum SortOption {
  Relevance = 'relevance',
  PriceLowHigh = 'price_asc',
  PriceHighLow = 'price_desc',
  Newest = 'newest',
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
