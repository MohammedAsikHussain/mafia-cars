import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Truck, CreditCard, Wallet, Banknote, X, CheckCircle, MapPin, ChevronRight, Minus, Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../services/apiclient';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user } = useShop();
  const navigate = useNavigate();
  
  const [buyQty, setBuyQty] = useState(1);
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
    try {
        const newOrder = await api.orders.create({
            userEmail: user?.email,
            customerName: shippingAddress.fullName,
            phoneNumber: shippingAddress.phone,
            address: fullAddressString,
            totalQuantity: buyQty,
            total: product.price * buyQty,
            items: [{ id: product.id, name: product.name, price: product.price, quantity: buyQty, image: product.image }],
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

  const isCustomer = user?.role === 'customer';

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10 relative">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-secondary font-medium mb-6 transition-colors text-sm md:text-base">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-secondary overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 sm:h-80 md:h-auto bg-gray-100 relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

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

              {/* QUANTITY SELECTOR */}
              {!product.isOutOfStock && isCustomer && (
                  <div className="flex items-center mb-6">
                      <span className="text-sm font-medium text-gray-700 mr-4">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                          <button onClick={decreaseQty} className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"><Minus className="w-4 h-4"/></button>
                          <span className="px-4 font-bold text-gray-900 min-w-[40px] text-center">{buyQty}</span>
                          <button onClick={increaseQty} className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"><Plus className="w-4 h-4"/></button>
                      </div>
                  </div>
              )}

              {/* BUTTON LOGIC */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 md:mb-8">
                {/* CASE 1: OUT OF STOCK */}
                {product.isOutOfStock ? (
                    <div className="w-full py-4 bg-gray-200 text-gray-500 font-bold text-center rounded-xl cursor-not-allowed border border-gray-300 text-lg">
                        Out of Stock
                    </div>
                ) : (
                    // CASE 2: IN STOCK
                    <>
                        {isCustomer ? (
                            // CASE 2A: LOGGED IN CUSTOMER
                            <>
                                <button onClick={() => addToCart(product, buyQty)} className="flex-1 bg-black text-white py-3 md:py-4 px-6 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center shadow-lg border border-transparent hover:border-secondary text-sm md:text-base">
                                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Add to Cart
                                </button>
                                <button onClick={handleBuyNow} className="flex-1 bg-secondary text-black py-3 md:py-4 px-6 rounded-xl font-bold hover:bg-yellow-300 transition-all flex items-center justify-center shadow-lg border border-black text-sm md:text-base">
                                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Buy Now
                                </button>
                            </>
                        ) : (
                            // CASE 2B: GUEST (SHOW LOGIN PROMPT)
                            <div className="w-full text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 font-medium text-sm md:text-base">
                                Please <span className="font-bold underline cursor-pointer">Login</span> to purchase items.
                            </div>
                        )}
                    </>
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
              <>
                <div className="p-6 space-y-4 overflow-y-auto">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'upi' ? 'border-secondary bg-yellow-50 ring-1 ring-secondary' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedPayment('upi')}>
                    <div className="w-5 h-5 rounded-full border border-gray-400 mr-4 flex items-center justify-center">{selectedPayment === 'upi' && <div className="w-3 h-3 bg-secondary rounded-full" />}</div>
                    <div className="flex-1"><div className="font-bold text-gray-900">UPI / GPay / PhonePe</div><div className="text-xs text-gray-500">Pay securely via your preferred UPI app</div></div>
                  </label>
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'card' ? 'border-secondary bg-yellow-50 ring-1 ring-secondary' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedPayment('card')}>
                    <div className="w-5 h-5 rounded-full border border-gray-400 mr-4 flex items-center justify-center">{selectedPayment === 'card' && <div className="w-3 h-3 bg-secondary rounded-full" />}</div>
                    <div className="flex-1"><div className="font-bold text-gray-900">Credit / Debit Card</div><div className="text-xs text-gray-500">Visa, Mastercard, RuPay</div></div><CreditCard className="w-5 h-5 text-gray-400" />
                  </label>
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'cod' ? 'border-secondary bg-yellow-50 ring-1 ring-secondary' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedPayment('cod')}>
                    <div className="w-5 h-5 rounded-full border border-gray-400 mr-4 flex items-center justify-center">{selectedPayment === 'cod' && <div className="w-3 h-3 bg-secondary rounded-full" />}</div>
                    <div className="flex-1"><div className="font-bold text-gray-900">Cash on Delivery</div><div className="text-xs text-gray-500">Pay when you receive the order</div></div><Banknote className="w-5 h-5 text-gray-400" />
                  </label>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4 text-sm"><span className="text-gray-600">Total Amount:</span><span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span></div>
                  <button onClick={handlePaymentSelectNext} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center">Next Step <ChevronRight className="w-4 h-4 ml-1" /></button>
                </div>
              </>
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