import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, user, toggleWishlist, isInWishlist } = useShop();

  // Pick first image or fallback
  const displayImage = product.images?.[0] || product.image;
  const isLiked = isInWishlist(product.id);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-secondary flex flex-col h-full relative group">
      
      {/* Wishlist Button (Top Right) */}
      <button 
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
      </button>

      {/* Out of Stock Overlay */}
      {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center pointer-events-none">
              <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-sm transform -rotate-12 shadow-lg">Out of Stock</span>
          </div>
      )}

      <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-gray-100 h-64 flex items-center justify-center">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <Link to={`/product/${product.id}`} className="text-lg font-bold text-gray-800 hover:text-secondary mb-2 line-clamp-2">
          {product.name}
        </Link>
        
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-secondary fill-current" />
          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
          {!product.isUpcoming && !product.isOutOfStock && user?.role === 'customer' && (
            <button 
              onClick={() => addToCart(product)}
              className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors border border-transparent hover:border-secondary"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;