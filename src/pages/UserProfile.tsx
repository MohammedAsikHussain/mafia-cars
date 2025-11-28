import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ArrowLeft, Clock, CheckCircle, Truck, Pencil, Save, X, Camera, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../services/api';

const UserProfile: React.FC = () => {
  const { user, logout, updateUserProfile } = useShop();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('123 Mafia Street, New York, NY');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    const fetchMyOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const data = await api.orders.getMyOrders();
            const formatted = data.map((o: any) => ({
                id: o.id,
                date: new Date(o.created_at).toLocaleDateString(),
                total: o.total,
                status: o.status,
                summary: o.product_summary // Using Text Summary instead of Items JSON
            }));
            formatted.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(formatted);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setIsLoadingOrders(false);
        }
    };
    fetchMyOrders();
  }, [user]);

  useEffect(() => {
    if (!user) navigate('/');
    else if (user.role === 'admin') navigate('/admin');
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleSaveProfile = () => { if (name.trim()) updateUserProfile(name); setIsEditing(false); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!user || user.role === 'admin') return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'Shipped': return <Truck className="w-4 h-4 text-blue-500" />;
        default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-secondary font-medium mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                    <div className="bg-black h-24 relative">
                        <div className="absolute top-4 right-4 z-10">
                            {isEditing ? (
                                <div className="flex space-x-2">
                                    <button onClick={() => setIsEditing(false)} className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"><X className="w-4 h-4" /></button>
                                    <button onClick={handleSaveProfile} className="p-1.5 bg-secondary text-black rounded-full hover:bg-yellow-400 transition-colors"><Save className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors flex items-center space-x-1 px-3"><Pencil className="w-3 h-3" /><span className="text-xs font-medium">Edit Profile</span></button>
                            )}
                        </div>
                        <div className="absolute -bottom-10 left-6 group">
                            <div className="w-20 h-20 bg-white rounded-full p-1 relative">
                                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden relative">
                                    {profilePic ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}
                                    {isEditing && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors" onClick={() => fileInputRef.current?.click()}><Camera className="w-6 h-6 text-white" /><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} /></div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 px-6 pb-6">
                        {isEditing ? (<div className="mb-1"><label className="text-xs text-gray-500 uppercase font-bold">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-b-2 border-secondary focus:outline-none py-1 text-lg font-bold text-gray-900" /></div>) : (<h1 className="text-2xl font-bold text-gray-900">{name}</h1>)}
                        <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                        <div className="space-y-4">
                            <div className="flex items-start text-gray-600">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-1"><MapPin className="w-4 h-4" /></div>
                                <div className="flex-1">{isEditing ? <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-secondary" rows={2} /> : <span className="text-sm">{address}</span>}</div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button onClick={handleLogout} className="w-full py-2 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"><LogOut className="w-4 h-4 mr-2" /> Logout</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Package className="w-5 h-5 mr-2" /> Order History</h2>
                
                {isLoadingOrders ? (
                    <div className="text-center py-10 text-gray-500">Loading history...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-10 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No order history</h3>
                        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                        <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">Start Shopping</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 border-b border-gray-50 flex flex-wrap justify-between items-center bg-gray-50/50">
                                    <div><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order ID</span><div className="text-sm font-bold text-gray-900">#{order.id.slice(0, 6).toUpperCase()}</div></div>
                                    <div><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date</span><div className="text-sm text-gray-700">{order.date}</div></div>
                                    <div><span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</span><div className="text-sm font-bold text-gray-900">₹{order.total.toFixed(2)}</div></div>
                                    <div className="flex items-center mt-2 sm:mt-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {getStatusIcon(order.status)}<span className="ml-1.5">{order.status}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center text-gray-700">
                                        {/* Show Text Summary instead of Items */}
                                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="font-medium">{order.summary || 'Items'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;