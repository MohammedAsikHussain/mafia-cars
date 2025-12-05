import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, Bell, LogOut, Package, Heart, ShoppingCart, Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'account' | 'addresses' | 'payment' | 'notifications'>('account');

  if (!user) { navigate('/'); return null; }

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">Customer</span>
                <span className="text-gray-400 text-xs border border-gray-200 px-2 py-0.5 rounded-full">Member since 2024</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6 flex overflow-x-auto">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'payment', label: 'Payment', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white shadow-sm text-black font-bold' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
          
          {/* TAB: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                <button className="text-sm border px-4 py-1 rounded-lg hover:bg-gray-50">Edit</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-900">{user.name}</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-500">{user.email}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <button onClick={() => navigate('/orders')} className="p-4 border border-gray-200 rounded-xl hover:border-black transition-all flex flex-col items-center text-center">
                      <Package className="w-6 h-6 mb-2 text-blue-600" />
                      <span className="font-bold text-sm">View Orders</span>
                   </button>
                   <button className="p-4 border border-gray-200 rounded-xl hover:border-black transition-all flex flex-col items-center text-center">
                      <Heart className="w-6 h-6 mb-2 text-red-500" />
                      <span className="font-bold text-sm">My Wishlist</span>
                   </button>
                   <button onClick={() => navigate('/cart')} className="p-4 border border-gray-200 rounded-xl hover:border-black transition-all flex flex-col items-center text-center">
                      <ShoppingCart className="w-6 h-6 mb-2 text-yellow-500" />
                      <span className="font-bold text-sm">Shopping Cart</span>
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
                 <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Add New Address
                 </button>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6 mb-4 relative hover:border-black transition-colors">
                 <div className="absolute top-4 right-4 text-sm text-blue-600 font-medium cursor-pointer">Edit</div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{user.name}</span>
                    <span className="bg-gray-200 text-xs px-2 py-0.5 rounded text-gray-600">Default</span>
                 </div>
                 <p className="text-gray-600 text-sm">123 Mafia Street, Apt 4B</p>
                 <p className="text-gray-600 text-sm">New York, NY 10001</p>
                 <p className="text-gray-600 text-sm">United States</p>
                 <p className="text-gray-500 text-sm mt-2">+1 (555) 123-4567</p>
              </div>
            </div>
          )}

          {/* TAB: PAYMENT */}
          {activeTab === 'payment' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
                 <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Add Card</button>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                 <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
                 <p className="text-gray-500 mb-4">No payment methods saved yet</p>
                 <button className="bg-black text-white px-6 py-2 rounded-lg text-sm">Add Your First Card</button>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
             <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                
                {[
                    { title: 'Order Updates', desc: 'Get notified about your order status' },
                    { title: 'Promotions & Offers', desc: 'Receive exclusive deals and discounts' },
                    { title: 'Product Recommendations', desc: 'Personalized product suggestions' },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                        <div>
                            <p className="font-bold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </div>
                ))}
                <div className="flex justify-between items-center py-4">
                    <div>
                         <p className="font-bold text-gray-900">Newsletter</p>
                         <p className="text-sm text-gray-500">Weekly updates and tips</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfile;