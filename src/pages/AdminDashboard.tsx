import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Wand2, AlertCircle, ArrowLeft, Search, Filter, MoreHorizontal, CheckCircle, Truck, Clock, Pencil, Trash2, X, RefreshCw, Upload, Loader2, Eye, MapPin, Phone, Mail, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { generateProductDescription } from '../services/geminiService';
import { api } from '../services/api'; 
import { Product } from '../types';
import { CATEGORIES } from '../services/mockData';

const AdminDashboard: React.FC = () => {
  const { user, products, addProduct, updateProduct, deleteProduct } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // NEW: State for Viewing Order Details
  const [viewOrder, setViewOrder] = useState<any | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
      name: '', price: 0, category: 'Electronics', description: '', 
      images: [], tags: [], isUpcoming: false, isOutOfStock: false 
  });
  
  const [imageInput, setImageInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
        <button onClick={() => navigate(-1)} className="absolute top-24 left-4 md:left-10 inline-flex items-center text-black hover:text-secondary font-medium transition-colors"><ArrowLeft className="w-5 h-5 mr-2" /> Back</button>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" /><h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getAllAdmin();
        const formattedOrders = data.map((order: any) => ({
            id: order.id, 
            customer: order.customer_name || 'Guest',
            email: order.user_email, // Captured for details
            phone: order.phone_number || 'N/A', // Captured for details
            address: order.shipping_address || 'No address provided', // Captured for details
            date: new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString(),
            total: order.total,
            status: order.status,
            productName: order.product_summary || 'Unknown Items'
        }));
        formattedOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(formattedOrders);
      } catch (error) { console.error("Failed to load orders:", error); }
    };
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = () => { setOpenMenuOrderId(null); };
    if (openMenuOrderId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openMenuOrderId]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    const desc = await generateProductDescription(newProduct.name || '', keywords);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleEditClick = (product: Product) => { 
      setEditingId(product.id); 
      setNewProduct({ ...product }); 
      setImageInput(product.images ? product.images.join(',\n') : product.image || '');
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  
  const handleDeleteClick = (id: string) => { 
      if (window.confirm("Are you sure you want to delete this product?")) { 
          deleteProduct(id); 
          if (editingId === id) resetForm(); 
      } 
  };
  
  const resetForm = () => { 
      setEditingId(null); 
      setNewProduct({ name: '', price: 0, category: 'Electronics', description: '', images: [], tags: [], isUpcoming: false, isOutOfStock: false }); 
      setImageInput('');
      setKeywords(''); 
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imageArray = imageInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s !== '');
    const productToSave = { ...newProduct, images: imageArray } as Product;
    if (editingId) { updateProduct({ ...productToSave, id: editingId }); alert("Updated!"); }
    else { addProduct({ ...productToSave, id: Date.now().toString(), rating: 0, reviews: 0, tags: [] }); alert("Created!"); }
    resetForm();
  };

  const toggleOrderStatus = (e: React.MouseEvent, orderId: string) => { e.stopPropagation(); setOpenMenuOrderId(openMenuOrderId === orderId ? null : orderId); };
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setOpenMenuOrderId(null);
    if (viewOrder && viewOrder.id === orderId) setViewOrder({ ...viewOrder, status: newStatus }); // Update modal if open
    await api.orders.updateStatus(orderId, newStatus);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Delivered': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</span>;
        case 'Shipped': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Truck className="w-3 h-3 mr-1" /> Shipped</span>;
        case 'Returned': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><RefreshCw className="w-3 h-3 mr-1" /> Returned</span>;
        default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" /> Processing</span>;
    }
  };

  const filteredOrders = orders.filter(order => filterStatus === 'All' || order.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-secondary font-medium mb-4 transition-colors"><ArrowLeft className="w-5 h-5 mr-2" /> Back</button>
          <div className="flex justify-between items-center">
            <div><h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1></div>
            <div className="flex space-x-2">
               <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'products' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>Products</button>
               <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'orders' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>Orders</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit' : 'Add'} Product</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Name" className="border p-2 rounded" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})} required/>
                            <input type="number" placeholder="Price" className="border p-2 rounded" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price:parseFloat(e.target.value)})} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (One per line or comma separated)</label>
                            <textarea placeholder="https://image1.jpg,&#10;https://image2.jpg" className="border p-2 rounded w-full h-24 font-mono text-xs" value={imageInput} onChange={e=>setImageInput(e.target.value)}/>
                            {imageInput && (<div className="flex gap-2 mt-2 overflow-x-auto pb-2">{imageInput.split(/[\n,]+/).map((src, idx) => src.trim() && (<img key={idx} src={src.trim()} alt="preview" className="h-12 w-12 object-cover rounded border" onError={(e) => e.currentTarget.style.display='none'} />))}</div>)}
                        </div>
                        <select className="border p-2 rounded w-full" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category:e.target.value})}>{CATEGORIES.filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}</select>
                        <textarea rows={4} className="border p-2 rounded w-full" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description:e.target.value})} required></textarea>
                        <div className="flex space-x-6">
                            <div className="flex items-center"><input type="checkbox" id="isUpcoming" checked={newProduct.isUpcoming || false} onChange={(e) => setNewProduct({...newProduct, isUpcoming: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary" /><label htmlFor="isUpcoming" className="ml-2 text-sm font-medium text-gray-900">Upcoming</label></div>
                            <div className="flex items-center"><input type="checkbox" id="isOutOfStock" checked={newProduct.isOutOfStock || false} onChange={(e) => setNewProduct({...newProduct, isOutOfStock: e.target.checked})} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" /><label htmlFor="isOutOfStock" className="ml-2 text-sm font-bold text-red-600">Stock Out</label></div>
                        </div>
                        <button type="submit" className="w-full bg-black text-white py-3 rounded font-bold">{editingId?'Update':'Add'}</button>
                    </form>
                </div>
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[800px] overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-900">Existing Products</h3></div>
                  <div className="divide-y divide-gray-100">
                    {products.length === 0 ? (<div className="p-8 text-center text-gray-500">No products found.</div>) : (products.map(product => (<div key={product.id} className={`p-4 flex items-center transition-colors hover:bg-gray-50 ${editingId === product.id ? 'bg-yellow-50' : ''}`}><img src={product.images?.[0] || product.image} alt="" className="w-12 h-12 rounded-md object-cover mr-3 border border-gray-200" /><div className="flex-1 min-w-0 mr-2"><h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4><div className="flex items-center text-xs text-gray-500"><span className="mr-2">₹{product.price}</span>{product.isUpcoming && <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded">New</span>}{product.isOutOfStock && <span className="text-red-600 font-bold bg-red-50 px-1 rounded ml-1">Out</span>}</div></div><div className="flex space-x-1"><button onClick={() => handleEditClick(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDeleteClick(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button></div></div>)))}
                  </div>
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-gray-900">Orders</h2>
                   <div className="relative">
                        <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="p-2 border rounded-lg hover:bg-gray-50 flex items-center"><Filter className="w-5 h-5" /></button>
                        {isFilterMenuOpen && (
                            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                {['All', 'Processing', 'Shipped', 'Delivered', 'Returned'].map(s => (
                                    <button key={s} onClick={() => { setFilterStatus(s); setIsFilterMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{s}</button>
                                ))}
                            </div>
                        )}
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">#{order.id.slice(0, 6).toUpperCase()}</td>
                          <td className="px-6 py-4 text-gray-700 font-bold">{order.customer}</td>
                          <td className="px-6 py-4 text-gray-600">{order.productName}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">₹{order.total.toFixed(2)}</td>
                          <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 text-right relative flex justify-end gap-2">
                             {/* VIEW DETAILS BUTTON */}
                             <button onClick={() => setViewOrder(order)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Details">
                                <Eye className="w-5 h-5" />
                             </button>
                             
                             {/* ACTION MENU */}
                             <button onClick={(e) => toggleOrderStatus(e, order.id)} className="p-1.5 text-gray-400 hover:text-primary rounded-md transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                             </button>
                             {openMenuOrderId === order.id && (
                                <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                    {['Processing', 'Shipped', 'Delivered', 'Returned'].map(status => (
                                        <button key={status} onClick={() => updateOrderStatus(order.id, status)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{status}</button>
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
            </div>
          )}
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {viewOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">Order #{viewOrder.id.slice(0, 8).toUpperCase()}</h3>
                          <p className="text-xs text-gray-500">{viewOrder.date}</p>
                      </div>
                      <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto">
                      {/* Status */}
                      <div className="mb-6">
                          <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Status</span>
                          {getStatusBadge(viewOrder.status)}
                      </div>

                      {/* Products */}
                      <div className="mb-6">
                          <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Items Ordered</span>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex items-start">
                                  <Package className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                  <div>
                                      <p className="text-sm font-bold text-gray-900">{viewOrder.productName}</p>
                                      <p className="text-xs text-gray-500">Total: ₹{viewOrder.total.toFixed(2)}</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-4">
                          <div>
                              <span className="text-xs font-bold text-gray-500 uppercase mb-1 block">Customer</span>
                              <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900 font-medium">{viewOrder.customer}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 ml-6">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{viewOrder.email}</span>
                              </div>
                          </div>

                          <div>
                              <span className="text-xs font-bold text-gray-500 uppercase mb-1 block">Contact</span>
                              <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">{viewOrder.phone}</span>
                              </div>
                          </div>

                          <div>
                              <span className="text-xs font-bold text-gray-500 uppercase mb-1 block">Shipping Address</span>
                              <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <p className="text-sm text-gray-900 leading-relaxed">{viewOrder.address}</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                      <button onClick={() => setViewOrder(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Close</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;