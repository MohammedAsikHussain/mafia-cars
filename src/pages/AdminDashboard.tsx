import React, { useState, useEffect } from 'react';
// ... imports (same as before) ...
import { Package, Plus, Wand2, BarChart3, AlertCircle, ArrowLeft, TrendingUp, Search, Filter, MoreHorizontal, CheckCircle, Truck, Clock, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { generateProductDescription } from '../services/geminiService';
import { api } from '../services/apiclient.tsx'; 
import { Product } from '../types';
import { CATEGORIES } from '../services/mockData';

// ... (Component Logic same as before) ...

const AdminDashboard: React.FC = () => {
  // ... (All hooks and state logic remain exactly the same) ...
  const { user, products, addProduct, updateProduct, deleteProduct } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, category: 'Electronics', description: '', image: '', tags: [], isUpcoming: false });
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user || user.role !== 'admin') return <div>Access Denied</div>;

  useEffect(() => {
    if(activeTab === 'orders') {
        api.orders.getAllAdmin().then(data => {
            const formatted = data.map((o:any) => ({...o, id: o.id, customer: o.user_email || 'Guest', date: new Date(o.created_at).toLocaleDateString(), items: Array.isArray(o.items) ? o.items.length : 1}));
            setOrders(formatted.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        });
    }
  }, [activeTab]);

  // ... (Handlers: handleGenerateDescription, handleSubmit, etc. - same as before) ...
  const handleGenerateDescription = async () => {
      setIsGenerating(true);
      const desc = await generateProductDescription(newProduct.name || '', keywords);
      setNewProduct({...newProduct, description: desc});
      setIsGenerating(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(editingId) updateProduct({...newProduct as Product, id: editingId});
      else addProduct({...newProduct as Product, id: Date.now().toString(), rating:0, reviews:0, tags:[]});
      setEditingId(null); setNewProduct({ name: '', price: 0, category: 'Electronics', description: '', image: '', tags: [], isUpcoming: false }); setKeywords('');
  };
  const toggleOrderStatus = (e: any, id: string) => { e.stopPropagation(); setOpenMenuOrderId(openMenuOrderId === id ? null : id); };
  const updateOrderStatus = async (id: string, status: string) => {
      setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o)); setOpenMenuOrderId(null);
      await api.orders.updateStatus(id, status);
  };

  const filteredOrders = orders.filter(o => filterStatus === 'All' || o.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center mb-4"><ArrowLeft className="mr-2"/> Back</button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-2">
               <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg ${activeTab === 'products' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Products</button>
               <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-primary text-white' : 'bg-gray-100'}`}>Orders</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ... (Stats Cards - Use Grid cols-1 md:cols-3) ... */}
        
        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    {/* Form Content - Responsive Inputs */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Name" className="border p-2 rounded w-full" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} required />
                            <input type="number" placeholder="Price" className="border p-2 rounded w-full" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: parseFloat(e.target.value)})} required />
                        </div>
                        <input type="text" placeholder="Image URL" className="border p-2 rounded w-full" value={newProduct.image} onChange={e=>setNewProduct({...newProduct, image: e.target.value})} />
                        <select className="border p-2 rounded w-full" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})}>
                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {/* AI Section */}
                        <div className="bg-indigo-50 p-4 rounded">
                            <input type="text" placeholder="Keywords" className="border p-2 rounded w-full mb-2" value={keywords} onChange={e=>setKeywords(e.target.value)} />
                            <button type="button" onClick={handleGenerateDescription} className="w-full bg-indigo-600 text-white py-2 rounded">Generate AI Description</button>
                        </div>
                        <textarea rows={4} className="border p-2 rounded w-full" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} required></textarea>
                        <button type="submit" className="w-full bg-black text-white py-3 rounded font-bold">{editingId ? 'Update' : 'Add'} Product</button>
                    </form>
                </div>
                {/* Product List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
                    {products.map(p => (
                        <div key={p.id} className="p-4 border-b flex justify-between items-center">
                            <div className="flex items-center overflow-hidden">
                                <img src={p.image} className="w-10 h-10 rounded mr-3 object-cover"/>
                                <div className="truncate mr-2 font-bold text-sm">{p.name}</div>
                            </div>
                            <div className="flex space-x-1 shrink-0">
                                <button onClick={() => {setEditingId(p.id); setNewProduct(p); window.scrollTo(0,0);}} className="text-blue-500"><Pencil className="w-4 h-4"/></button>
                                <button onClick={() => deleteProduct(p.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Filter Header */}
                <div className="p-4 border-b flex justify-between">
                    <h2 className="font-bold">Orders</h2>
                    <div className="relative">
                        <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="border p-2 rounded"><Filter className="w-4 h-4"/></button>
                        {isFilterMenuOpen && (
                            <div className="absolute right-0 bg-white shadow-xl border rounded z-10 w-32">
                                {['All', 'Processing', 'Shipped', 'Delivered', 'Returned'].map(s => (
                                    <button key={s} onClick={() => {setFilterStatus(s); setIsFilterMenuOpen(false)}} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">{s}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* RESPONSIVE TABLE WRAPPER */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Action</th></tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(o => (
                                <tr key={o.id} className="border-b">
                                    <td className="px-6 py-4 font-mono">#{o.id.slice(0,6).toUpperCase()}</td>
                                    <td className="px-6 py-4">{o.customer}</td>
                                    <td className="px-6 py-4">₹{o.total}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${o.status==='Delivered'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{o.status}</span></td>
                                    <td className="px-6 py-4 relative">
                                        <button onClick={(e) => toggleOrderStatus(e, o.id)}><MoreHorizontal/></button>
                                        {openMenuOrderId === o.id && (
                                            <div className="absolute right-10 bg-white shadow-xl border rounded z-50 w-32">
                                                {['Processing', 'Shipped', 'Delivered', 'Returned'].map(s => (
                                                    <button key={s} onClick={() => updateOrderStatus(o.id, s)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">{s}</button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;