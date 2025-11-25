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

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-secondary flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative group overflow-hidden bg-gray-100 h-64 flex items-center justify-center">
        <img 
          src={product.image} 
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
          {/* Only show Add to Cart if product is NOT Upcoming AND User is Logged In as Customer */}
          {!product.isUpcoming && user?.role === 'customer' && (
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