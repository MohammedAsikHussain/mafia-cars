import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, Box, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../services/api';

const OrderHistory: React.FC = () => {
  const { user, products } = useShop();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    const fetchMyOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const data = await api.orders.getMyOrders();
            const formatted = data.map((o: any) => {
                const matchingProduct = products.find(p => o.product_summary?.includes(p.name));
                const productImage = matchingProduct ? (matchingProduct.images?.[0] || matchingProduct.image) : null;

                return {
                    id: o.id,
                    date: new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    total: o.total,
                    status: o.status,
                    summary: o.product_summary,
                    image: productImage,
                    trackingNumber: o.status === 'Shipped' ? `TRK${o.id.slice(0, 9).toUpperCase()}` : null
                };
            });
            formatted.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(formatted);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setIsLoadingOrders(false);
        }
    };
    if (user) fetchMyOrders();
  }, [user, products]);

  if (!user) return null;

  const activeOrders = orders.filter(o => ['Processing', 'Shipped'].includes(o.status));
  const pastOrders = orders.filter(o => ['Delivered', 'Returned'].includes(o.status));
  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <button onClick={() => navigate('/profile')} className="text-sm font-medium text-gray-500 hover:text-black">Back to Profile</button>
        </div>

        <div className="flex space-x-2 mb-6">
            <button onClick={() => setActiveTab('active')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Active ({activeOrders.length})</button>
            <button onClick={() => setActiveTab('past')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'past' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Past ({pastOrders.length})</button>
        </div>

        <div className="space-y-6">
            {isLoadingOrders ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">Loading...</div>
            ) : displayOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400"><Package className="w-8 h-8" /></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No {activeTab} orders</h3>
                    <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-black text-white rounded-lg">Start Shopping</button>
                </div>
            ) : (
                displayOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/50">
                            <div><p className="text-sm text-gray-500 mb-1">Order <span className="font-mono text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span></p><p className="text-xs text-gray-400">Placed on {order.date}</p></div>
                            <div>
                                {order.status === 'Shipped' && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700"><Truck className="w-3 h-3 mr-1"/> Shipped</span>}
                                {order.status === 'Processing' && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> Processing</span>}
                                {order.status === 'Delivered' && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Delivered</span>}
                            </div>
                        </div>
                        <div className="p-6 flex items-start gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                {order.image ? <img src={order.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Box className="w-8 h-8"/></div>}
                            </div>
                            <div className="flex-1"><h4 className="font-bold text-gray-900 text-base mb-1">{order.summary}</h4><p className="text-sm text-gray-500">Premium Quality • Verified</p></div>
                            <div className="text-right"><p className="font-bold text-gray-900">₹{order.total.toFixed(2)}</p></div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;