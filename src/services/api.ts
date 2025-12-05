import { Product, Order, User, AuthResponse, Review } from '../types';
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

  // NEW: STORAGE (Image Upload Logic)
  storage: {
    uploadImage: async (file: File): Promise<string> => {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, file);
        
        if (error) throw error;

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);
            
        return publicUrlData.publicUrl;
    }
  },

  // PRODUCTS
  products: {
    getAll: async (params?: string): Promise<Product[]> => {
      let query = supabase.from('products').select('*');
      const { data, error } = await query;
      if (error) { console.error("Error fetching products:", error); return []; }
      return data.map((item: any) => ({ 
          ...item, 
          images: item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
          image: item.image || (item.images && item.images.length > 0 ? item.images[0] : ''),
          isUpcoming: item.isUpcoming,
          isOutOfStock: item.isOutOfStock,
          specifications: item.specifications // New Field
      }));
    },
    create: async (product: any): Promise<Product> => {
      const { data, error } = await supabase.from('products').insert([{
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          specifications: product.specifications, // Save Spec
          images: product.images, 
          image: product.images && product.images.length > 0 ? product.images[0] : product.image,
          tags: product.tags,
          "isUpcoming": product.isUpcoming,
          "isOutOfStock": product.isOutOfStock
        }]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, product: Partial<Product>): Promise<Product> => {
      const updateData: any = {
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          specifications: product.specifications, // Update Spec
          images: product.images,
          tags: product.tags,
          "isUpcoming": product.isUpcoming,
          "isOutOfStock": product.isOutOfStock
      };
      if (product.images && product.images.length > 0) {
          updateData.image = product.images[0];
      }
      const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return false;
      return true;
    }
  },

  // ... (Reviews, Orders, User, Categories sections remain unchanged)
  reviews: {
    getByProduct: async (productId: string): Promise<Review[]> => {
        const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
        if (error) return [];
        return data as Review[];
    },
    create: async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
        const { data, error } = await supabase.from('reviews').insert([review]).select().single();
        if (error) throw error;
        return data as Review;
    }
  },
  orders: {
    create: async (orderData: any): Promise<Order> => {
      const summaryText = orderData.items.map((i: any) => `${i.quantity || 1}x ${i.name}`).join(', ');
      const { data, error } = await supabase.from('orders').insert([{
          user_email: orderData.userEmail || 'guest@example.com',
          customer_name: orderData.customerName,
          phone_number: orderData.phoneNumber,
          shipping_address: orderData.address,
          quantity: orderData.totalQuantity,
          total: orderData.total,
          product_summary: summaryText,
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
  user: {
    updateProfile: async (data: Partial<User>): Promise<User> => {
        return { ...data } as User; 
    }
  },
  categories: {
    getAll: async (): Promise<string[]> => {
        const { data, error } = await supabase.from('categories').select('name').order('created_at', { ascending: true });
        if (error) return [];
        return ['All', ...data.map((c: any) => c.name)];
    },
    create: async (name: string): Promise<string> => {
        const { data, error } = await supabase.from('categories').insert([{ name }]).select().single();
        if (error) throw error;
        return data.name;
    }
  }
};