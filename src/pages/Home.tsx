import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';

const Home: React.FC = () => {
  const { products } = useShop();
  const navigate = useNavigate();
  
  // Filter by isUpcoming flag and Limit to 4 products
  const featuredProducts = products.filter(p => p.isUpcoming).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Single Static Image */}
      <section className="relative bg-black text-white overflow-hidden min-h-[600px] h-screen max-h-[800px]">
        
        <div className="absolute inset-0">
          {/* Single Image: Reverted to object-cover (original look) */}
          <img 
            src="https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/dodge_challenger_srt_4k-HD.jpg" 
            alt="Dodge Challenger" 
            className="w-full h-full object-cover opacity-60 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        {/* Text Content */}
        <div className="container mx-auto px-8 md:px-20 relative z-10 h-full flex flex-col justify-center pt-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
              <span className="text-secondary font-ethnocentric tracking-widest">Mc Accessories</span> <br />
              <span className="text-white font-bankGothic text-2xl md:text-4xl uppercase tracking-wider">Make Them Stare</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed drop-shadow-lg max-w-xl font-medium">
              Premium Car Accessories • Style • Performance <br/>
              <span className="text-sm text-gray-300">Elevate your drive with our exclusive collection.</span>
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/shop" className="px-8 py-4 bg-secondary text-black rounded-lg font-bold hover:bg-yellow-300 transition-all flex items-center justify-center shadow-lg hover:scale-105 transform duration-200">
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-secondary hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-secondary mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">AI Recommendations</h3>
              <p className="text-gray-600">Our AI analyzes your style to suggest products you'll actually love.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-secondary hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-secondary mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Visual Search</h3>
              <p className="text-gray-600">Snap a photo of something you like, and we'll find similar items instantly.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-secondary hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-secondary mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Secure & Fast</h3>
              <p className="text-gray-600">Enjoy secure payments and lightning-fast delivery tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Products</h2>
              <p className="text-gray-600">Arrival soon</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-10">
                Check back soon for new arrivals!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;