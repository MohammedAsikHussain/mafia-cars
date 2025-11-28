import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, user } = useShop();

  // Pick first image or fallback
  const displayImage = product.images?.[0] || product.image;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-secondary flex flex-col h-full relative">
      
      {/* Out of Stock Overlay */}
      {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-sm transform -rotate-12 shadow-lg">Out of Stock</span>
          </div>
      )}

      <Link to={`/product/${product.id}`} className="relative group overflow-hidden bg-gray-100 h-64 flex items-center justify-center">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
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