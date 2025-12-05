import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { products, wishlist } = useShop();
  const navigate = useNavigate();

  // Filter products that match IDs in the wishlist array
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
             <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
             </div>
             <span className="text-gray-500 font-medium">{wishlistProducts.length} items</span>
        </div>

        {wishlistProducts.length === 0 ? (
             <div className="text-center py-20">
                 <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                     <Heart className="w-10 h-10 fill-current" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                 <p className="text-gray-500 mb-6">Save items you want to buy later.</p>
                 <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">Explore Shop</button>
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;