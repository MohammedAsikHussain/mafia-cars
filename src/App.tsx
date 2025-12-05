import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';
import AIChatbot from './components/AIChatbot';
import { ShopProvider, useShop } from './context/ShopContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Hidden Admin Login Popup Component
const AdminSecretLogin: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login } = useShop();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo password
    if (password === 'admin123') {
      login('admin');
      navigate('/admin');
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Invalid Access Key');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-secondary relative overflow-hidden">
          {/* Secret Header */}
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
          
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">System Override</h2>
          <p className="text-center text-gray-500 text-sm mb-6">Admin authentication required</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => { setPassword(e.target.value); setError(''); }}
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all font-mono text-center tracking-widest"
                 placeholder="ENTER PASSKEY"
                 autoFocus
               />
               {error && <p className="text-red-500 text-xs text-center mt-2 font-bold">{error}</p>}
             </div>
             
             <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black text-secondary rounded-lg hover:bg-gray-800 font-bold transition-colors shadow-lg border border-secondary"
                >
                  Authenticate
                </button>
             </div>
             
             <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-400 font-mono">DEBUG: Passkey is 'admin123'</p>
             </div>
          </form>
       </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const location = useLocation();
  
  // Logic for Hidden Admin Login (Keyboard)
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState('');
  
  // Logic for Hidden Admin Login (Mobile Tap)
  const [tapCount, setTapCount] = useState(0);

  // 1. Keyboard Listener (For Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key && e.key.length === 1) {
        setKeyBuffer(prev => {
          const newBuffer = (prev + e.key).slice(-9).toLowerCase(); 
          if (newBuffer === 'ajimadmin') {
            setShowAdminPopup(true);
            return ''; 
          }
          return newBuffer;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Tap Listener (For Mobile)
  const handleSecretTap = () => {
      setTapCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) { // Open after 5 taps
              setShowAdminPopup(true);
              return 0;
          }
          return newCount;
      });
      
      // Reset count if user stops tapping for 1 second
      setTimeout(() => setTapCount(0), 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminSecretLogin isOpen={showAdminPopup} onClose={() => setShowAdminPopup(false)} />
      
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </main>
      <AIChatbot />
      <footer className="bg-black text-white py-10 mt-auto border-t-2 border-secondary">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm font-sans">Kadayanallur - Tenkasi - 627751</p>
            <p className="text-gray-400 text-sm font-sans mt-1">All over India shipping available</p>
            <p className="text-gray-400 text-sm font-sans mt-1">mcaccessories2025@gmail.com</p>
          </div>
          <div className="text-center md:text-right md:pr-24">
            {/* ADDED SECRET TAP HERE */}
            <p 
                onClick={handleSecretTap} 
                className="text-gray-400 cursor-pointer select-none active:text-secondary transition-colors"
            >
                © 2024 Mafia cars.
            </p>
            <p className="text-gray-400 text-sm font-sans mt-1">9345034579</p>
            <p className="text-gray-400 text-sm font-sans mt-1">9344738217</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ShopProvider>
      <Router>
        <ScrollToTop />
        <Layout />
      </Router>
    </ShopProvider>
  );
};

export default App;