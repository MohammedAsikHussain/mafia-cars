import { Product, Order, User, AuthResponse } from '../types';
import { supabase } from '../supabaseClient';

export const api = {
  // AUTH
  auth: {
    login: async (credentials: any): Promise<AuthResponse> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.identifier,
        password: credentials.password,
      });
      if (error) throw error;
      const role = credentials.identifier.includes('admin') ? 'admin' : 'customer';
      return {
        user: {
          id: data.user.id,
          name: data.user.user_metadata.name || 'User',
          email: data.user.email || '',
          role: role,
        },
        token: data.session.access_token
      };
    },
    register: async (data: any): Promise<AuthResponse> => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name } },
      });
      if (error) throw error;
      if (!authData.user) throw new Error("Registration failed");
      return {
        user: {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          role: 'customer',
        },
        token: authData.session?.access_token
      };
    }
  },

  // PRODUCTS
  products: {
    getAll: async (params?: string): Promise<Product[]> => {
      let query = supabase.from('products').select('*');
      const { data, error } = await query;
      if (error) { console.error("Error fetching products:", error); return []; }
      return data.map((item: any) => ({ ...item, isUpcoming: item.isUpcoming }));
    },
    create: async (product: any): Promise<Product> => {
      const { data, error } = await supabase.from('products').insert([{
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          image: product.image,
          tags: product.tags,
          "isUpcoming": product.isUpcoming
        }]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, product: Partial<Product>): Promise<Product> => {
      const { data, error } = await supabase.from('products').update({
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          image: product.image,
          tags: product.tags,
          "isUpcoming": product.isUpcoming
        }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return false;
      return true;
    }
  },

  // ORDERS
  orders: {
    create: async (orderData: any): Promise<Order> => {
      const { data, error } = await supabase.from('orders').insert([{
          user_email: 'guest@example.com',
          total: orderData.total,
          items: orderData.items,
          status: 'Processing'
        }]).select().single();
      if (error) throw error;
      return data;
    },
    getMyOrders: async (): Promise<Order[]> => {
       const { data, error } = await supabase.from('orders').select('*');
       if (error) return [];
       return data;
    },
    getAllAdmin: async (): Promise<Order[]> => {
       const { data, error } = await supabase.from('orders').select('*');
       if (error) return [];
       return data;
    },
    updateStatus: async (id: string, status: string): Promise<Order> => {
       const { data, error } = await supabase.from('orders').update({ status: status }).eq('id', id).select().single();
       if (error) throw error;
       return data;
    }
  },

  // USER
  user: {
    updateProfile: async (data: Partial<User>): Promise<User> => {
        return { ...data } as User; 
    }
  }
};