import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowLeft, Settings, Lightbulb, Smartphone, CircleDashed, SprayCan, Wind, Radio, Copy, Armchair, Footprints, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
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

  const getIcon = (name: string) => {
    const icons: {[key: string]: JSX.Element} = {
        'Gear Knobs': <Settings className="w-5 h-5 md:w-6 md:h-6" />,
        'DRL Lights': <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />,
        'Mobile Holders': <Smartphone className="w-5 h-5 md:w-6 md:h-6" />,
        'Steerings': <CircleDashed className="w-5 h-5 md:w-6 md:h-6" />,
        'Dashboard Wax': <SprayCan className="w-5 h-5 md:w-6 md:h-6" />,
        'Dashboard Perfumes': <Wind className="w-5 h-5 md:w-6 md:h-6" />,
        'Car Antennas': <Radio className="w-5 h-5 md:w-6 md:h-6" />,
        'Mirror Covers': <Copy className="w-5 h-5 md:w-6 md:h-6" />,
        'Armrest': <Armchair className="w-5 h-5 md:w-6 md:h-6" />,
        'Pedal Covers': <Footprints className="w-5 h-5 md:w-6 md:h-6" />
    };
    return icons[name] || <Tag className="w-5 h-5 md:w-6 md:h-6" />;
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lowerQ) || p.tags.some(t => t.toLowerCase().includes(lowerQ)));
    }
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }
    switch (sortOption) {
      case SortOption.PriceLowHigh: result.sort((a, b) => a.price - b.price); break;
      case SortOption.PriceHighLow: result.sort((a, b) => b.price - a.price); break;
      case SortOption.Newest: result.sort((a, b) => parseInt(b.id) - parseInt(a.id)); break;
    }
    return result;
  }, [selectedCategory, sortOption, searchQuery, products]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-black hover:text-secondary font-medium mb-4 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shop All Products</h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
            {searchQuery ? `Results for "${searchQuery}"` : "Explore our premium collection"}
          </p>

          {/* Category Scroller: Overflow auto for mobile swipe */}
          <div className="pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex flex-nowrap gap-3 md:gap-4">
               <button 
                onClick={() => setSelectedCategory("All")}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 md:px-5 md:py-3 rounded-full shadow-sm border transition-all ${selectedCategory === "All" ? 'bg-secondary border-secondary' : 'bg-white border-gray-200 hover:border-secondary'}`}
              >
                <span className={`font-medium whitespace-nowrap text-sm md:text-base ${selectedCategory === "All" ? 'text-black' : 'text-gray-700'}`}>All Items</span>
              </button>

              {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 md:px-5 md:py-3 rounded-full shadow-sm border transition-all ${selectedCategory === cat ? 'bg-secondary border-secondary' : 'bg-white border-gray-200 hover:border-secondary'}`}
                >
                  <span className={`${selectedCategory === cat ? 'text-black' : 'text-gray-500'} transition-colors`}>{getIcon(cat)}</span>
                  <span className={`font-medium whitespace-nowrap text-sm md:text-base ${selectedCategory === cat ? 'text-black' : 'text-gray-700'}`}>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <span className="text-gray-500 text-sm font-medium">Found {filteredProducts.length} results</span>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-primary shadow-sm"
                  >
                    <option value={SortOption.Relevance}>Relevance</option>
                    <option value={SortOption.PriceLowHigh}>Price: Low to High</option>
                    <option value={SortOption.PriceHighLow}>Price: High to Low</option>
                    <option value={SortOption.Newest}>Newest Arrivals</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 md:p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-lg md:text-xl text-gray-600 font-medium mb-2">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filters.</p>
                <button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition">Clear Filters</button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Shop;