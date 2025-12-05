import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, User } from '../types';
import { api } from '../services/api';

interface ShopContextType {
  cart: CartItem[];
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
  categories: string[];
  addCategory: (name: string) => void;
  // NEW: Wishlist Functions
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  // NEW: Wishlist State (Persisted in LocalStorage)
  const [wishlist, setWishlist] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('mafia_wishlist');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });

  useEffect(() => {
      localStorage.setItem('mafia_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
            api.products.getAll(),
            api.categories.getAll()
        ]);
        setProducts(prodData || []);
        if (catData && catData.length > 1) { 
            setCategories(catData);
        } else {
            setCategories(['All', 'Gear Knobs', 'DRL Lights', 'Mobile Holders', 'Steerings', 'Dashboard Wax', 'Dashboard Perfumes', 'Car Antennas', 'Mirror Covers', 'Armrest', 'Pedal Covers']);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product: Product, count: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + count } : item);
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

  const addCategory = async (name: string) => {
    try {
        await api.categories.create(name);
        setCategories(prev => [...prev, name]);
    } catch (error) {
        console.error("Failed to add category", error);
        alert("Failed to add category.");
    }
  };

  // NEW: Toggle Wishlist Function
  const toggleWishlist = (productId: string) => {
      setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  
  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <ShopContext.Provider value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
        user, login, logout, updateUserProfile,
        products, addProduct, updateProduct, deleteProduct,
        categories, addCategory,
        wishlist, toggleWishlist, isInWishlist
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