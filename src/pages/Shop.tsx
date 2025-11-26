import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, User } from '../types';
import { api } from '../services/apiclient';

interface ShopContextType {
  cart: CartItem[];
  // UPDATED: addToCart now accepts a quantity (count)
  addToCart: (product: Product, count?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  user: User | null;
  login: (role: 'admin' | 'customer', customName?: string, customEmail?: string) => void;
  logout: () => void;
  updateUserProfile: (name: string) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.getAll();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // UPDATED: Handles adding specific quantity
  const addToCart = (product: Product, count: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + count } : item
        );
      }
      return [...prev, { ...product, quantity: count }];
    });
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((item) => item.id !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const login = async (role: 'admin' | 'customer', customName?: string, customEmail?: string) => {
    setUser({
      id: 'u123',
      name: customName || (role === 'admin' ? 'Admin User' : 'Customer'),
      role: role,
      email: customEmail || (role === 'admin' ? 'admin@mafiacars.com' : 'user@example.com')
    });
  };

  const logout = () => setUser(null);
  const updateUserProfile = (name: string) => setUser((prev) => (prev ? { ...prev, name } : null));

  const addProduct = async (product: Product) => {
    try {
      const newProduct = await api.products.create(product);
      setProducts((prev) => [...prev, newProduct]);
    } catch (error) {
      console.error("Failed to add product", error);
      alert("Failed to save to database.");
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await api.products.update(updatedProduct.id, updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    } catch (error) { console.error(error); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <ShopContext.Provider value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
        user, login, logout, updateUserProfile,
        products, addProduct, updateProduct, deleteProduct
      }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};