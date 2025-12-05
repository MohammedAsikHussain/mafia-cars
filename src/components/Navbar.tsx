import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Camera, Mail, Lock, KeyRound, LogOut } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { analyzeImageForSearch } from '../services/geminiService';
import { api } from '../services/api';

// Login Modal (Same as before)
interface LoginModalProps { isOpen: boolean; onClose: () => void; onLoginSuccess: (name: string, email: string) => void; initialView?: 'login' | 'signup'; }

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { if(isOpen) { setView(initialView); setErrorMessage(''); setIdentifier(''); setPassword(''); setSignupName(''); setSignupEmail(''); setSignupPassword(''); } }, [isOpen, initialView]);
  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); setIsLoading(true); try { const res = await api.auth.login({identifier, password}); onLoginSuccess(res.user.name, identifier); onClose(); } catch(e:any){ setErrorMessage(e.message); } finally { setIsLoading(false); }};
  const handleSignup = async (e: React.FormEvent) => { e.preventDefault(); setIsLoading(true); try { const res = await api.auth.register({email: signupEmail, password: signupPassword, name: signupName}); onLoginSuccess(res.user.name, signupEmail); onClose(); } catch(e:any){ setErrorMessage(e.message); } finally { setIsLoading(false); }};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4"><X/></button>
        <h2 className="text-2xl font-bold text-center mb-6">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full border p-3 rounded-xl" value={identifier} onChange={e=>setIdentifier(e.target.value)} required/>
                <input type="password" placeholder="Password" className="w-full border p-3 rounded-xl" value={password} onChange={e=>setPassword(e.target.value)} required/>
                <button disabled={isLoading} className="w-full bg-black text-white py-3 rounded-xl font-bold">Login</button>
                <p className="text-center text-sm">No account? <button type="button" onClick={()=>setView('signup')} className="font-bold underline">Sign Up</button></p>
            </form>
        ) : (
            <form onSubmit={handleSignup} className="space-y-4">
                <input type="text" placeholder="Name" className="w-full border p-3 rounded-xl" value={signupName} onChange={e=>setSignupName(e.target.value)} required/>
                <input type="email" placeholder="Email" className="w-full border p-3 rounded-xl" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} required/>
                <input type="password" placeholder="Password" className="w-full border p-3 rounded-xl" value={signupPassword} onChange={e=>setSignupPassword(e.target.value)} required/>
                <button disabled={isLoading} className="w-full bg-secondary text-black py-3 rounded-xl font-bold">Sign Up</button>
                <p className="text-center text-sm">Have account? <button type="button" onClick={()=>setView('login')} className="font-bold underline">Login</button></p>
            </form>
        )}
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { cart, user, login, logout } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';
  const isShop = location.pathname === '/shop';

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/shop?search=${encodeURIComponent(searchQuery)}`); setIsMenuOpen(false); }
  };

  const onLoginSuccess = (name: string, email: string) => { login('customer', name, email); navigate('/'); };

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={onLoginSuccess} />
      <nav className={isHome ? "absolute top-0 w-full z-50 bg-transparent" : "relative w-full z-50 bg-white shadow-md border-b-2 border-secondary"}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-black tracking-tight" style={{ WebkitTextStroke: '1px #FACC15' }}>Mafia Cars</Link>
            
            {/* Desktop Search */}
            {!isHome && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                <form onSubmit={handleSearch} className="w-full relative">
                    <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-1 border-gray-300 focus:border-secondary" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </form>
              </div>
            )}

            <div className="hidden md:flex items-center space-x-6">
              {!isHome && !isProfile && !isShop && <Link to="/shop" className={isHome ? "text-gray-100 hover:text-secondary font-medium" : "text-gray-600 hover:text-secondary font-medium"}>Shop</Link>}
              {user?.role === 'admin' && <Link to="/admin" className="text-gray-600 font-medium">Admin</Link>}
              
              {!isHome && user?.role === 'customer' && (
                <Link to="/cart" className="relative text-gray-600 hover:text-secondary">
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-secondary text-black font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
                </Link>
              )}

              {user ? (
                <div className="relative h-full flex items-center" ref={profileMenuRef}>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center focus:outline-none py-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 hover:border-secondary transition-all">
                        <User className="w-6 h-6 text-gray-700" />
                    </div>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl"><p className="text-sm font-bold text-gray-900">{user.name}</p></div>
                        <div className="py-1">
                            {user.role === 'admin' ? (
                                <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black transition-colors">Dashboard</Link>
                            ) : (
                                <>
                                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black transition-colors">Profile</Link>
                                {/* UPDATED LINK TO ORDERS */}
                                <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black transition-colors">My Orders</Link>
                                </>
                            )}
                        </div>
                        <div className="border-t border-gray-100">
                            <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center rounded-b-xl"><LogOut className="w-4 h-4 mr-2" /> Logout</button>
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className={`flex items-center space-x-1 ${isHome ? 'text-gray-200' : 'text-gray-600'} hover:text-secondary`}><User className="w-6 h-6" /><span className="text-sm font-medium">Login</span></button>
              )}
              {!user && <button onClick={() => setIsLoginModalOpen(true)} className="px-5 py-2 bg-secondary text-black rounded-full font-bold hover:bg-yellow-400 transition-transform hover:scale-105 text-sm shadow-sm">Sign Up</button>}
            </div>

            <button className={`md:hidden ${isHome ? 'text-white' : 'text-gray-600'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-xl">
            <div className="px-4 pt-4 pb-2 space-y-3">
              {!isHome && <Link to="/shop" className="block text-gray-600 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>Shop</Link>}
              {!isHome && user?.role === 'customer' && <Link to="/cart" className="block text-gray-600 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>Cart ({cart.length})</Link>}
              
              {user ? (
                  <>
                    <Link to="/profile" className="block text-gray-900 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                    <Link to="/orders" className="block text-gray-900 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                    <button onClick={() => {logout(); setIsMenuOpen(false)}} className="text-red-500 font-medium py-2 w-full text-left">Logout</button>
                  </>
              ) : (
                  <button onClick={() => {setIsLoginModalOpen(true); setIsMenuOpen(false)}} className="text-gray-600 font-medium hover:text-secondary text-left py-2 flex items-center"><User className="w-5 h-5 mr-2" /> Login</button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;