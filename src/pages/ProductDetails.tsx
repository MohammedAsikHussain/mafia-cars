import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Truck, CreditCard, X, CheckCircle, Minus, Plus, ChevronLeft, ChevronRight, Heart, Shield } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../services/api';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user } = useShop();
  const navigate = useNavigate();
  
  const [buyQty, setBuyQty] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'payment' | 'address' | 'gateway' | 'success'>('payment');
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  
  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const product = products.find(p => p.id === id);

  // Get images safely
  const allImages = product 
    ? (product.images && product.images.length > 0 ? product.images : [product.image || '']) 
    : [];

  // Mock Data for UI matching
  const originalPrice = product ? (product.price * 1.3).toFixed(2) : 0;
  const discount = 25; 

  // Handlers
  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const increaseQty = () => setBuyQty(prev => prev + 1);
  const decreaseQty = () => setBuyQty(prev => (prev > 1 ? prev - 1 : 1));

  const handleBuyNow = () => { setShowPaymentModal(true); setCheckoutStep('payment'); };
  const handlePaymentSelectNext = () => { setCheckoutStep('address'); };

  const handleAddressSubmitNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.phone || !shippingAddress.zip || !shippingAddress.fullName) {
      alert("Please fill in all required fields.");
      return;
    }
    setCheckoutStep('gateway');
    const fullAddressString = `${shippingAddress.address}, ${shippingAddress.city} - ${shippingAddress.zip}`;
    
    const selectedImageForOrder = allImages[currentImageIndex];

    try {
        const newOrder = await api.orders.create({
            userEmail: user?.email,
            customerName: shippingAddress.fullName,
            phoneNumber: shippingAddress.phone,
            address: fullAddressString,
            totalQuantity: buyQty,
            total: product.price * buyQty,
            items: [{ 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                quantity: buyQty, 
                image: selectedImageForOrder 
            }],
        });
        setCreatedOrder(newOrder);
        setTimeout(() => {
            setCheckoutStep('success');
            setTimeout(() => { setShowPaymentModal(false); setCheckoutStep('payment'); setCreatedOrder(null); setBuyQty(1); }, 5000);
        }, 2000);
    } catch (error) {
        alert("Failed to create order");
        setCheckoutStep('address');
    }
  };

  const handleAddToCart = () => {
      const selectedImageForOrder = allImages[currentImageIndex];
      const productWithSelectedImage = { ...product, image: selectedImageForOrder };
      addToCart(productWithSelectedImage, buyQty);
  };

  const isCustomer = user?.role === 'customer';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* --- LEFT: IMAGES --- */}
            <div>
                <div className="relative h-[500px] w-full rounded-3xl overflow-hidden bg-white border border-gray-100 group flex items-center justify-center">
                    <img 
                        src={allImages[currentImageIndex]} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-4 transition-opacity duration-300" 
                    />
                    {/* Arrows */}
                    {allImages.length > 1 && (
                        <>
                            {currentImageIndex > 0 && (
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all">
                                    <ChevronLeft className="w-6 h-6 text-black" />
                                </button>
                            )}
                            {currentImageIndex < allImages.length - 1 && (
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all">
                                    <ChevronRight className="w-6 h-6 text-black" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* --- RIGHT: DETAILS --- */}
            <div className="flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 font-semibold tracking-wide uppercase mb-1">{product.category}</p>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2 mb-4">
                             <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />)}
                             </div>
                             <span className="text-sm text-gray-500 font-medium">{product.rating} ({product.reviews} reviews)</span>
                        </div>
                    </div>
                    <button className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-6 h-6" />
                    </button>
                </div>

                {/* Price Section */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                    <span className="text-4xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                    <span className="text-xl text-gray-400 line-through">₹{originalPrice}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md">{discount}% OFF</span>
                </div>

                {/* Status */}
                <div className="mb-6">
                    {product.isOutOfStock ? (
                        <span className="text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                    ) : (
                        <span className="text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">✓ In Stock (Ready to Ship)</span>
                    )}
                </div>

                {/* REMOVED COLOR SELECTOR HERE */}

                {/* Quantity & Actions */}
                {!product.isOutOfStock && isCustomer ? (
                    <div className="mb-8">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Quantity</span>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center border border-gray-300 rounded-xl w-fit">
                                <button onClick={decreaseQty} className="p-3 hover:bg-gray-50 rounded-l-xl"><Minus className="w-4 h-4"/></button>
                                <span className="px-4 font-bold text-gray-900 min-w-[40px] text-center">{buyQty}</span>
                                <button onClick={increaseQty} className="p-3 hover:bg-gray-50 rounded-r-xl"><Plus className="w-4 h-4"/></button>
                            </div>
                            
                            <div className="flex gap-3 flex-1">
                                <button onClick={handleAddToCart} className="flex-1 bg-black text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center shadow-md">
                                    <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                                </button>
                                <button onClick={handleBuyNow} className="flex-1 bg-white text-black border-2 border-black py-3 px-6 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ) : !isCustomer ? (
                    <div className="w-full text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 font-medium mb-8">
                        Please <span className="font-bold underline cursor-pointer">Login</span> to purchase items.
                    </div>
                ) : (
                    <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold text-center rounded-xl mb-8 border border-gray-200">Currently Unavailable</div>
                )}

                {/* Trust Badges (REMOVED RETURN POLICY) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-gray-400"/> Free shipping over ₹500</div>
                    <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-gray-400"/> Quality Assured</div>
                </div>
            </div>
        </div>

        {/* --- BOTTOM TABS SECTION --- */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
                {['description', 'highlights', 'reviews'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === tab ? 'bg-gray-50 text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {/* Renamed 'specs' to 'highlights' */}
                        {tab === 'highlights' ? 'Highlights' : tab}
                    </button>
                ))}
            </div>
            <div className="p-8">
                {activeTab === 'description' && (
                    <div className="prose max-w-none">
                        <h3 className="text-lg font-bold mb-4">Product Description</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                    </div>
                )}
                {activeTab === 'highlights' && (
                    <div className="bg-gray-50 p-6 rounded-xl">
                         <h3 className="text-lg font-bold mb-4">Product Highlights</h3>
                         {/* Use Description as Highlights if no separate data */}
                         <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {product.description}
                         </p>
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">A</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm">Arun Kumar</h4>
                                    <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">Excellent quality! Fits perfectly on my car. Highly recommended.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* PAYMENT MODAL (Same Logic) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 flex flex-col max-h-[90vh]">
             {checkoutStep !== 'success' && checkoutStep !== 'gateway' && (
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Checkout</h3>
                <button onClick={() => setShowPaymentModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
            )}
            {checkoutStep === 'payment' && (
              <div className="p-6">
                 <div className="space-y-4 mb-4">
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${selectedPayment === 'upi' ? 'border-black bg-gray-50' : 'border-gray-200'}`} onClick={() => setSelectedPayment('upi')}>
                        <div className="font-bold">UPI / GPay</div>
                    </label>
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${selectedPayment === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200'}`} onClick={() => setSelectedPayment('cod')}>
                        <div className="font-bold">Cash on Delivery</div>
                    </label>
                 </div>
                 <button onClick={handlePaymentSelectNext} className="w-full bg-black text-white py-3.5 rounded-xl font-bold">Next</button>
              </div>
            )}
            {checkoutStep === 'address' && (
                <form onSubmit={handleAddressSubmitNext} className="p-6 flex flex-col gap-4">
                    <input type="text" placeholder="Full Name" className="border p-3 rounded-lg" required value={shippingAddress.fullName} onChange={e=>setShippingAddress({...shippingAddress, fullName: e.target.value})}/>
                    <input type="text" placeholder="Address" className="border p-3 rounded-lg" required value={shippingAddress.address} onChange={e=>setShippingAddress({...shippingAddress, address: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="City" className="border p-3 rounded-lg" required value={shippingAddress.city} onChange={e=>setShippingAddress({...shippingAddress, city: e.target.value})}/>
                         <input type="text" placeholder="ZIP" className="border p-3 rounded-lg" required value={shippingAddress.zip} onChange={e=>setShippingAddress({...shippingAddress, zip: e.target.value})}/>
                    </div>
                    <input type="tel" placeholder="Phone" className="border p-3 rounded-lg" required value={shippingAddress.phone} onChange={e=>setShippingAddress({...shippingAddress, phone: e.target.value})}/>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">Complete Order</button>
                </form>
            )}
            {checkoutStep === 'gateway' && (
                <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="font-bold text-lg">Processing Payment...</h3>
                </div>
            )}
            {checkoutStep === 'success' && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8" /></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                    <p className="text-gray-500">Order ID: #{createdOrder?.id?.slice(0,6).toUpperCase()}</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;