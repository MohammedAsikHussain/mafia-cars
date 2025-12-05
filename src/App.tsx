import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/OrderHistory'; // NEW IMPORT
import AIChatbot from './components/AIChatbot';
import { ShopProvider, useShop } from './context/ShopContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AdminSecretLogin: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login } = useShop();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">System Override</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div><input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono text-center tracking-widest" placeholder="ENTER PASSKEY" autoFocus />{error && <p className="text-red-500 text-xs text-center mt-2 font-bold">{error}</p>}</div>
             <div className="flex gap-3 mt-6"><button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">Abort</button><button type="submit" className="flex-1 px-4 py-3 bg-black text-secondary rounded-lg font-bold shadow-lg border border-secondary">Authenticate</button></div>
          </form>
       </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key && e.key.length === 1) {
        setKeyBuffer(prev => {
          const newBuffer = (prev + e.key).slice(-9).toLowerCase();
          if (newBuffer === 'ajimadmin') { setShowAdminPopup(true); return ''; }
          return newBuffer;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <Route path="/orders" element={<OrderHistory />} /> {/* NEW ROUTE */}
        </Routes>
      </main>
      <AIChatbot />
      <footer className="bg-black text-white py-10 mt-auto border-t-2 border-secondary">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left"><p className="text-gray-400 text-sm font-sans">Kadayanallur - Tenkasi - 627751</p><p className="text-gray-400 text-sm font-sans mt-1">All over India shipping available</p></div>
          <div className="text-center md:text-right md:pr-24"><p className="text-gray-400">© 2024 Mafia cars.</p><p className="text-gray-400 text-sm font-sans mt-1">9345034579</p></div>
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