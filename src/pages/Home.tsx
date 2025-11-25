import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';

const HERO_IMAGES = [
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/reddodge.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/1694437-1920x1080-desktop-1080p-dodge-background-photo%20(1).jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/1694632-3840x2160-desktop-4k-dodge-background-image.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/1694565-3840x2160-desktop-4k-dodge-background.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/1694709-3840x2160-desktop-4k-dodge-background.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/dpodge5.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/dodge4.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/dodge2.jpg",
  "https://raw.githubusercontent.com/MohammedAsikHussain/MafiaCars/main/3dodge.jpg"
];

const Home: React.FC = () => {
  const { products } = useShop();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const featuredProducts = products.filter(p => p.isUpcoming).slice(0, 4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden h-[80vh] min-h-[500px] md:h-screen md:max-h-[800px]">
        
        {/* Slideshow */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={img} 
                alt={`Car Slideshow ${index}`} 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>
        
        {/* Text Content - Responsive Sizing */}
        <div className="container mx-auto px-6 md:px-20 relative z-10 h-full flex flex-col justify-center pt-10 md:pt-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-2xl">
              <span className="text-secondary font-ethnocentric tracking-widest block mb-2">Mc Accessories</span>
              <span className="text-white font-bankGothic text-xl sm:text-2xl md:text-4xl uppercase tracking-wider">Make Them Stare</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 md:mb-8 leading-relaxed drop-shadow-lg max-w-xl font-medium">
              Premium Car Accessories • Style • Performance <br/>
              <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">Elevate your drive with our exclusive collection.</span>
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-start">
              <Link to="/shop" className="px-6 py-3 md:px-8 md:py-4 bg-secondary text-black rounded-lg font-bold hover:bg-yellow-300 transition-all flex items-center justify-center shadow-lg hover:scale-105 transform duration-200 text-sm md:text-base">
                Start Shopping
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-secondary hover:shadow-lg transition-shadow flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-secondary mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">AI Recommendations</h3>
              <p className="text-sm md:text-base text-gray-600">Our AI analyzes your style to suggest products you'll actually love.</p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-secondary hover:shadow-lg transition-shadow flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-secondary mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">Visual Search</h3>
              <p className="text-sm md:text-base text-gray-600">Snap a photo of something you like, and we'll find similar items.</p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-secondary hover:shadow-lg transition-shadow flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-secondary mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">Secure & Fast</h3>
              <p className="text-sm md:text-base text-gray-600">Enjoy secure payments and lightning-fast delivery tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Upcoming Products</h2>
              <p className="text-sm md:text-base text-gray-600">Arrival soon</p>
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