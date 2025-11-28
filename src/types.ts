export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[]; // Array of strings for multiple photos
  image?: string;   // Optional fallback for single photo
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

// THIS INTERFACE IS REQUIRED FOR LOGIN
export interface AuthResponse {
  user: User;
  token: string;
}