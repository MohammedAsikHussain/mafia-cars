import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowLeft, Settings, Lightbulb, Smartphone, CircleDashed, SprayCan, Wind, Radio, Copy, Armchair, Footprints, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
// Import the hardcoded categories
import { CATEGORIES } from '../services/mockData'; 
import { useShop } from '../context/ShopContext';
import { SortOption } from '../types';

const Shop: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = useShop();
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Relevance);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Parse query params for search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
        if (CATEGORIES.includes(search)) {
            setSelectedCategory(search);
            setSearchQuery('');
        } else {
            setSearchQuery(search);
        }
    } else {
        setSearchQuery('');
    }
  }, [location.search]);

  // Helper to get icons for the hardcoded categories
  const getIcon = (name: string) => {
    const icons: {[key: string]: JSX.Element} = {
        'Gear Knobs': <Settings className="w-6 h-6" />,
        'DRL Lights': <Lightbulb className="w-6 h-6" />,
        'Mobile Holders': <Smartphone className="w-6 h-6" />,
        'Steerings': <CircleDashed className="w-6 h-6" />,
        'Dashboard Wax': <SprayCan className="w-6 h-6" />,
        'Dashboard Perfumes': <Wind className="w-6 h-6" />,
        'Car Antennas': <Radio className="w-6 h-6" />,
        'Mirror Covers': <Copy className="w-6 h-6" />,
        'Armrest': <Armchair className="w-6 h-6" />,
        'Pedal Covers': <Footprints className="w-6 h-6" />
    };
    return icons[name] || <Tag className="w-6 h-6" />;
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.tags.some(t => t.toLowerCase().includes(lowerQ))
      );
    }

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortOption) {
      case SortOption.PriceLowHigh:
        result.sort((a, b) => a.price - b.price);
        break;
      case SortOption.PriceHighLow:
        result.sort((a, b) => b.price - a.price);
        break;
      case SortOption.Newest:
        // Mock newest by ID logic
        result.sort((a, b) => (a.id > b.id ? -1 : 1));
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, sortOption, searchQuery, products]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-black hover:text-secondary font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop All Products</h1>
          <p className="text-gray-600 mb-8">
            {searchQuery 
              ? `Results for "${searchQuery}"` 
              : "Explore our premium collection"}
          </p>

          {/* --- Shop by Category (Fixed List from mockData) --- */}
          <div className="pb-4 overflow-x-auto scrollbar-hide">
            <div className="flex flex-wrap gap-4">
               {/* 'All' button */}
               <button 
                onClick={() => setSelectedCategory("All")}
                className={`flex items-center space-x-2 px-5 py-3 rounded-full shadow-sm border transition-all group ${selectedCategory === "All" ? 'bg-secondary border-secondary' : 'bg-white border-gray-200 hover:border-secondary'}`}
              >
                <span className={`font-medium whitespace-nowrap ${selectedCategory === "All" ? 'text-black' : 'text-gray-700'}`}>
                  All Items
                </span>
              </button>

              {/* Map over Mock Data CATEGORIES */}
              {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-full shadow-sm border transition-all group ${selectedCategory === cat ? 'bg-secondary border-secondary' : 'bg-white border-gray-200 hover:border-secondary'}`}
                >
                  <span className={`${selectedCategory === cat ? 'text-black' : 'text-gray-500 group-hover:text-secondary'} transition-colors`}>
                    {getIcon(cat)}
                  </span>
                  <span className={`font-medium whitespace-nowrap ${selectedCategory === cat ? 'text-black' : 'text-gray-700'}`}>
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* --- END Category Section --- */}

        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 text-sm font-medium">
                Found {filteredProducts.length} results
              </span>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                  >
                    <option value={SortOption.Relevance}>Relevance</option>
                    <option value={SortOption.PriceLowHigh}>Price: Low to High</option>
                    <option value={SortOption.PriceHighLow}>Price: High to Low</option>
                    <option value={SortOption.Newest}>Newest Arrivals</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-xl text-gray-600 font-medium mb-2">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Shop;