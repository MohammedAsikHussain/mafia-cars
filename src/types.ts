export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  image?: string;
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  isUpcoming?: boolean;
  isOutOfStock?: boolean;
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
  token?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: CartItem[] | any[];
  customerId?: string;
  customerName?: string;
  phone_number?: string;
  product_summary?: string;
  shipping_address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- THIS WAS MISSING ---
export enum SortOption {
  Relevance = 'relevance',
  PriceLowHigh = 'price-low-high',
  PriceHighLow = 'price-high-low',
  Newest = 'newest',
}