import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Camera, Mail, Lock, KeyRound, LogOut } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { analyzeImageForSearch } from '../services/geminiService';
import { api } from '../services/api';

// --- Login Modal Component ---
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string) => void;
  initialView?: 'login' | 'signup';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot-email' | 'forgot-otp' | 'forgot-new-password'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setErrorMessage('');
      setIdentifier('');
      setPassword('');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setErrorMessage("Please fill in all fields"); return; }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await api.auth.login({ identifier: identifier, password: password });
      onLoginSuccess(response.user.name || 'Customer', identifier);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid email or password");
    } finally { setIsLoading(false); }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) { setErrorMessage("Please fill in all fields"); return; }
    if (signupPassword !== signupConfirmPassword) { setErrorMessage("Passwords do not match"); return; }
    if (signupPassword.length < 6) { setErrorMessage("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    try {
      const response = await api.auth.register({ email: signupEmail, password: signupPassword, name: signupName });
      onLoginSuccess(response.user.name, signupEmail);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Registration failed.");
    } finally { setIsLoading(false); }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) { setErrorMessage("Please enter your email"); return; }
    setIsLoading(true); setErrorMessage('');
    setTimeout(() => { setIsLoading(false); alert(`OTP sent to ${identifier}. (Demo OTP: 1234)`); setView('forgot-otp'); }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') { setErrorMessage("Invalid OTP. Try 1234."); return; }
    setErrorMessage(''); setView('forgot-new-password');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setErrorMessage("Passwords do not match"); return; }
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); alert("Password reset successfully! Please login."); setView('login'); setPassword(''); setErrorMessage(''); }, 1000);
  };

  const handleClose = () => { onClose(); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"><X className="w-6 h-6" /></button>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Password Reset'}</h2>
            <p className="text-sm text-gray-500 mt-2">Enter your details below</p>
          </div>
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100">{errorMessage}</div>}
          
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Email</label><div className="relative"><User className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" placeholder="user@example.com" required /></div></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Password</label><div className="relative"><Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" placeholder="••••••••" required /></div></div>
              <div className="flex justify-end"><button type="button" onClick={() => setView('forgot-email')} className="text-xs text-secondary font-bold hover:underline">Forgot Password?</button></div>
              <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 shadow-lg">{isLoading ? 'Verifying...' : 'Login'}</button>
              <div className="text-center mt-4"><p className="text-sm text-gray-600">Don't have an account? <button type="button" onClick={() => { setView('signup'); setErrorMessage(''); }} className="text-secondary font-bold hover:underline">Sign Up</button></p></div>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><div className="relative"><User className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="John Doe" required /></div></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Email</label><div className="relative"><Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="user@example.com" required /></div></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Password</label><div className="relative"><Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Create password" required /></div></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Confirm password" required /></div></div>
              <button type="submit" disabled={isLoading} className="w-full bg-secondary text-black py-3.5 rounded-xl font-bold hover:bg-yellow-400 shadow-lg">{isLoading ? 'Creating...' : 'Sign Up'}</button>
              <div className="text-center mt-4"><p className="text-sm text-gray-600">Already have an account? <button type="button" onClick={() => { setView('login'); setErrorMessage(''); }} className="text-black font-bold hover:underline">Login</button></p></div>
            </form>
          )}

          {(view === 'forgot-email' || view === 'forgot-otp' || view === 'forgot-new-password') && (
             <div className="text-center text-gray-500 py-10">Forgot Password flow is simulated for demo.</div>
          )}
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-black via-secondary to-black"></div>
      </div>
    </div>
  );
};


// --- Navbar Component ---

const Navbar: React.FC = () => {
  const { cart, user, login, logout } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalInitialView, setModalInitialView] = useState<'login' | 'signup'>('login');
  
  // NEW: Profile Menu State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';
  const isShop = location.pathname === '/shop';

  const navClasses = isHome 
    ? "absolute top-0 w-full z-50 transition-all duration-300 bg-transparent" 
    : "relative w-full z-50 transition-all duration-300 bg-white shadow-md border-b-2 border-secondary";

  const textClass = isHome 
    ? "text-gray-100 hover:text-secondary font-medium" 
    : "text-gray-600 hover:text-secondary font-medium";

  const iconClass = isHome
    ? "text-gray-200 hover:text-secondary"
    : "text-gray-600 hover:text-secondary";

  const searchInputClass = isHome
    ? "bg-white/90 focus:bg-white text-gray-900 border-transparent focus:ring-secondary"
    : "bg-white text-gray-900 border-gray-300 focus:border-secondary focus:ring-secondary";

  // Close profile menu when clicking outside
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
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSearching(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        const keywords = await analyzeImageForSearch(base64Data, mimeType);
        
        if (keywords && keywords.length > 0) {
          const query = keywords.join(' ');
          setSearchQuery(query);
          navigate(`/shop?search=${encodeURIComponent(query)}`);
        } else {
          alert("Could not identify product from image.");
        }
        setIsSearching(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsSearching(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const openLoginModal = () => {
    setModalInitialView('login');
    setIsLoginModalOpen(true);
  }

  const openSignupModal = () => {
    setModalInitialView('signup');
    setIsLoginModalOpen(true);
  }

  const onLoginSuccess = (name: string, email: string) => {
    login('customer', name, email);
    navigate('/'); 
  };

  return (
    <>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={onLoginSuccess}
        initialView={modalInitialView}
      />

      <nav className={navClasses}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-black tracking-tight" style={{ WebkitTextStroke: '1px #FACC15' }}>
              Mafia Cars
            </Link>

            {/* Desktop Search - Hidden on Home Page */}
            {!isHome && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                <form onSubmit={handleSearch} className="w-full relative">
                  <input
                    type="text"
                    placeholder={isSearching ? "Analyzing image..." : "Search products..."}
                    className={`w-full pl-10 pr-12 py-2 border rounded-full focus:outline-none focus:ring-1 transition-colors ${searchInputClass}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </form>
                <button 
                  type="button"
                  onClick={triggerFileUpload}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-secondary transition-colors"
                  title="Search by Image"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            )}

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Hide "Shop" link if on Profile Page OR Shop Page */}
              {!isHome && !isProfile && !isShop && (
                <Link to="/shop" className={textClass}>Shop</Link>
              )}
              
              {user?.role === 'admin' && (
                 <Link to="/admin" className={textClass}>Admin</Link>
              )}

              {/* Cart */}
              {!isHome && user?.role === 'customer' && (
                <Link to="/cart" className={`relative ${iconClass}`}>
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-black font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                // --- DROPDOWN WITH CLICK BEHAVIOR ---
                <div className="relative h-full flex items-center" ref={profileMenuRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center focus:outline-none ${iconClass} py-2`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 hover:border-secondary transition-all">
                        <User className="w-6 h-6 text-gray-700" />
                    </div>
                  </button>
                  
                  {/* Dropdown Content */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Header: Name Only (No Email) */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        </div>

                        {/* Links */}
                        <div className="py-1">
                        {user.role === 'admin' ? (
                            <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black transition-colors">Dashboard</Link>
                        ) : (
                            <>
                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black transition-colors">Profile</Link>
                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-black transition-colors">My Orders</Link>
                            </>
                        )}
                        </div>

                        {/* Footer: Logout */}
                        <div className="border-t border-gray-100">
                            <button 
                                onClick={() => { logout(); setIsProfileOpen(false); }} 
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center rounded-b-xl"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={openLoginModal}
                  className={`flex items-center space-x-1 ${iconClass}`}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}

              {/* Sign Up Button */}
              {!user && (
                <button
                  onClick={openSignupModal}
                  className="px-5 py-2 bg-secondary text-black rounded-full font-bold hover:bg-yellow-400 transition-transform hover:scale-105 text-sm shadow-sm"
                >
                  Sign Up
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden ${isHome ? 'text-white' : 'text-gray-600'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-xl">
            <div className="px-4 pt-4 pb-2 space-y-3">
               {!isHome && (
                 <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:border-secondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <button 
                    type="button" 
                    onClick={triggerFileUpload}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </form>
               )}

              {!isHome && !isProfile && !isShop && <Link to="/shop" className="block text-gray-600 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>Shop</Link>}
              
              {!isHome && user?.role === 'customer' && <Link to="/cart" className="block text-gray-600 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>Cart ({cart.length})</Link>}
              
              {user?.role === 'admin' && (
                 <Link to="/admin" className="block text-gray-600 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
              )}
              
              <div className="pt-2 border-t border-gray-100">
                {!user ? (
                   <div className="flex flex-col space-y-3">
                      <button 
                        onClick={() => {openLoginModal(); setIsMenuOpen(false)}} 
                        className="text-gray-600 font-medium hover:text-secondary text-left py-2 flex items-center"
                      >
                          <User className="w-5 h-5 mr-2" /> Login
                      </button>
                      <button onClick={() => {openSignupModal(); setIsMenuOpen(false)}} className="w-full bg-secondary text-black font-bold py-2 rounded-lg">Sign Up</button>
                   </div>
                ) : (
                  <>
                   {/* Direct Link in Mobile Menu too */}
                   <Link to="/profile" className="block text-gray-900 font-medium py-2 hover:text-secondary" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                   <button onClick={() => {logout(); setIsMenuOpen(false)}} className="text-red-500 font-medium py-2 w-full text-left">Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;