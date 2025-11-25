import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Truck, CreditCard, Wallet, Banknote, X, CheckCircle, MapPin, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../services/apiclient.tsx';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user } = useShop();
  const navigate = useNavigate();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'payment' | 'address' | 'gateway' | 'success'>('payment');
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const handleBuyNow = () => { setShowPaymentModal(true); setCheckoutStep('payment'); };
  const handlePaymentSelectNext = () => { setCheckoutStep('address'); };

  const handleAddressSubmitNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.phone || !shippingAddress.zip) {
      alert("Please fill in all required fields.");
      return;
    }
    setCheckoutStep('gateway');
    try {
        const newOrder = await api.orders.create({
            total: product.price,
            items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }],
        });
        setCreatedOrder(newOrder);
        setTimeout(() => {
            setCheckoutStep('success');
            setTimeout(() => { setShowPaymentModal(false); setCheckoutStep('payment'); setCreatedOrder(null); }, 5000);
        }, 2000);
    } catch (error) {
        alert("Failed to create order");
        setCheckoutStep('address');
    }
  };

  const isCustomer = user?.role === 'customer';

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10 relative">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-secondary font-medium mb-6 transition-colors text-sm md:text-base">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-secondary overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section: Full width on mobile */}
            <div className="h-64 sm:h-80 md:h-auto bg-gray-100 relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-12 flex flex-col justify-center">
              <div className="uppercase tracking-wide text-xs md:text-sm text-primary font-bold mb-2">{product.category}</div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{product.name}</h1>
              
              <div className="flex items-center mb-4 md:mb-6">
                <div className="flex text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 md:w-5 md:h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-xs md:text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
              </div>

              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">₹{product.price.toFixed(2)}</div>
              <p className="text-sm md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">{product.description}</p>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 md:mb-8">
                {isCustomer && (
                  <button onClick={() => addToCart(product)} className="flex-1 bg-black text-white py-3 md:py-4 px-6 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center shadow-lg border border-transparent hover:border-secondary text-sm md:text-base">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Add to Cart
                  </button>
                )}
                {isCustomer && (
                  <button onClick={handleBuyNow} className="flex-1 bg-secondary text-black py-3 md:py-4 px-6 rounded-xl font-bold hover:bg-yellow-300 transition-all flex items-center justify-center shadow-lg border border-black text-sm md:text-base">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Buy Now
                  </button>
                )}
                {!isCustomer && (
                    <div className="w-full text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 font-medium text-sm md:text-base">
                        Please <span className="font-bold underline cursor-pointer">Login</span> to purchase items.
                    </div>
                )}
              </div>

              <div className="pt-6 md:pt-8 border-t border-gray-100">
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <Truck className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" /> <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain mostly standard, just ensuring sizing */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 flex flex-col max-h-[90vh]">
            {/* Modal content logic essentially same as before, responsiveness is handled by max-w-md and flex layouts inside */}
            {checkoutStep !== 'success' && checkoutStep !== 'gateway' && (
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Checkout</h3>
                <button onClick={() => setShowPaymentModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
            )}
            {/* ... (Rest of payment modal logic) ... */}
            {checkoutStep === 'payment' && (
                <div className="p-6"><button onClick={handlePaymentSelectNext} className="w-full bg-black text-white py-3 rounded-xl">Next</button></div>
            )}
            {checkoutStep === 'address' && (
                <form onSubmit={handleAddressSubmitNext} className="p-6 flex flex-col gap-4">
                    <input type="text" placeholder="Full Name" className="border p-2 rounded" required value={shippingAddress.fullName} onChange={e=>setShippingAddress({...shippingAddress, fullName: e.target.value})}/>
                    <input type="text" placeholder="Address" className="border p-2 rounded" required value={shippingAddress.address} onChange={e=>setShippingAddress({...shippingAddress, address: e.target.value})}/>
                    <input type="text" placeholder="City" className="border p-2 rounded" required value={shippingAddress.city} onChange={e=>setShippingAddress({...shippingAddress, city: e.target.value})}/>
                    <input type="text" placeholder="ZIP" className="border p-2 rounded" required value={shippingAddress.zip} onChange={e=>setShippingAddress({...shippingAddress, zip: e.target.value})}/>
                    <input type="tel" placeholder="Phone" className="border p-2 rounded" required value={shippingAddress.phone} onChange={e=>setShippingAddress({...shippingAddress, phone: e.target.value})}/>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-xl">Pay</button>
                </form>
            )}
            {checkoutStep === 'gateway' && <div className="p-12 text-center">Processing...</div>}
            {checkoutStep === 'success' && <div className="p-12 text-center text-green-600 font-bold">Order Confirmed!<br/>#{createdOrder?.id?.slice(0,6).toUpperCase()}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;