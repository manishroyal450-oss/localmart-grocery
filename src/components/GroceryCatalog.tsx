import React from 'react';
import { ChevronRight, ArrowUpDown, Tag, Percent, Sparkles, Upload, Image as ImageIcon, Search, X, ChevronLeft } from 'lucide-react';
import { Product, CATEGORIES, CategoryType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ProductPlaceholderImage from './ProductPlaceholderImage';
import storefrontImg from '../assets/images/whole_foods_storefront_1783945953108.jpg';

const getSerialNumber = (id: string) => {
  const match = id.match(/\d+/);
  return match ? match[0] : '';
};

interface GroceryCatalogProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  cart: { [productId: string]: number };
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onUpdateProductImage: (productId: string, base64Image: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onProductClick?: (product: Product) => void;
  isAdmin?: boolean;
}

export default function GroceryCatalog({
  products,
  selectedCategory,
  setSelectedCategory,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateProductImage,
  searchQuery,
  setSearchQuery,
  onProductClick,
  isAdmin = false,
}: GroceryCatalogProps) {
  const [sortBy, setSortBy] = React.useState<'popular' | 'priceAsc' | 'priceDesc' | 'discount'>('popular');
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Banner slides corresponding to user-uploaded store photos (Produce, Cheese, Wine, Bakery, Meat, etc.)
  const bannerSlides = React.useMemo(() => [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'WELCOME',
      title: 'Whole Foods Market',
      desc: 'Your premium destination for natural, organic, and delicious local groceries sourced with care.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'FRESH PRODUCE',
      title: 'Farm-Fresh Fruits & Veggies',
      desc: '100% organic and hand-picked daily, supporting local farmers and sustainable agriculture.'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'CHEESE CELLAR',
      title: 'Artisanal Cheese Counter',
      desc: 'An exquisite hand-curated collection of local, raw milk, and award-winning imported cheeses.'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'BAKERY & BREAD',
      title: 'Artison Bakery & Pretzels',
      desc: 'Handcrafted sourdough loaves, giant pretzels, and butter croissants baked fresh every morning.'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1628102476629-f8c51110f241?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'WELLNESS DRINKS',
      title: 'Cold-Pressed Juices & Elixirs',
      desc: 'Recharge with refreshing organic kombucha, local mineral waters, and pure wellness shots.'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'PREPARED FOODS',
      title: 'Salad Bar & Hot Buffet',
      desc: 'Chef-prepared meals, fresh seasonal pastas, and gourmet salad bar items ready to enjoy.'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'FINE WINES',
      title: 'Gourmet Wine & Cellar Selection',
      desc: 'A premium curated list of biodynamic, organic, and estate-bottled wines for any occasion.'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'HOLIDAY SWEETS',
      title: 'Cakes, Cookies & Fine Sweets',
      desc: 'Indulge in our selection of rich chocolate fudges, decorative cakes, and classic cookies.'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'PREMIUM MEATS',
      title: 'Responsibly Sourced Poultry & Cuts',
      desc: 'No-antibiotics, pasture-raised, grass-fed beef and poultry prepared daily by skilled butchers.'
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'WELLNESS & BEAUTY',
      title: 'Pure Wellness & Natural Beauty',
      desc: 'Eco-friendly personal care, botanical skincare, and health supplements for daily vitality.'
    }
  ], []);

  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto scroll banner slides
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Offer banners
  const offers = [
    { id: 1, title: "Super Savings Days", desc: "Best Prices on all Pantry Staples & Rice", bg: "from-amber-500 to-orange-600", tag: "STAPLES" },
    { id: 2, title: "Farm Fresh Morning", desc: "Veggies & Fruits direct from local orchards", bg: "from-emerald-500 to-teal-600", tag: "FRESHGREEN" },
    { id: 3, title: "Dairy Deals Special", desc: "Get Fresh Milk, Butter & Paneer at best rates", bg: "from-sky-500 to-blue-600", tag: "DAIRYGOLD" }
  ];

  const [activeOffer, setActiveOffer] = React.useState(0);

  // Auto scroll offers
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filter and Sort products
  const processedProducts = React.useMemo(() => {
    let result = [...products];

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discA = a.originalPrice - a.price;
        const discB = b.originalPrice - b.price;
        return discB - discA;
      });
    } // 'popular' maintains server order

    return result;
  }, [products, sortBy]);

  // Handle direct image upload from card
  const handleCardImageUpload = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit to 5MB in UI
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateProductImage(productId, base64String);
    };
    reader.readAsDataURL(file);
  };

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="font-sans px-4 py-6 md:px-8 max-w-7xl mx-auto" id="grocery-catalog-section">
      
      {/* Whole Foods Storefront Hero Banner - Auto Animated Slideshow of Store Images */}
      <div className="mb-8 rounded-xl overflow-hidden relative shadow-md h-56 md:h-72 group bg-slate-950" id="store-hero-banner">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={bannerSlides[currentSlide].image} 
              alt={bannerSlides[currentSlide].title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Content with entry animation */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 pointer-events-none">
          <div className="max-w-xl">
            <motion.span 
              key={`tag-${currentSlide}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-[#2874f0] text-white text-[10px] font-black px-2.5 py-1 rounded tracking-wider uppercase inline-block mb-2"
            >
              {bannerSlides[currentSlide].tag}
            </motion.span>
            <motion.h1 
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm"
            >
              {bannerSlides[currentSlide].title}
            </motion.h1>
            <motion.p 
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs md:text-sm text-gray-200 mt-1.5 font-medium leading-relaxed max-w-lg drop-shadow-sm"
            >
              {bannerSlides[currentSlide].desc}
            </motion.p>
          </div>
        </div>

        {/* Carousel Navigation Arrow Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
          title="Previous Slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
          title="Next Slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Navigation Indicator Dots */}
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Majestic Centered Google-Style Search Form */}
      <div className="max-w-2xl mx-auto mb-10 mt-2 text-center" id="google-search-section">
        {/* Brand subtitle matching Google Search Home */}
        <div className="flex items-center justify-center gap-2 mb-4 select-none">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans italic bg-gradient-to-r from-[#2874f0] via-yellow-500 to-[#25D366] bg-clip-text text-transparent">
            Whole Foods Market
          </span>
          <span className="text-xs bg-yellow-100 text-yellow-800 font-black px-3 py-0.5 rounded-full font-mono uppercase tracking-wider">
            Premium
          </span>
        </div>
        
        {/* Rounded-full iconic search box container */}
        <div className="relative group max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#2874f0] transition-colors" />
          </div>
          
          <input
            type="text"
            placeholder="Search catalog for fresh apples, local dairy, bread..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-[#2874f0] text-sm text-gray-800 transition-all font-medium"
            id="google-search-input"
          />

          {/* Right Action Icons (X to clear, Mic, Lens) */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                title="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {searchQuery && <span className="h-5 w-[1px] bg-gray-200" />}

            {/* Google-like Mic Icon */}
            <button
              type="button"
              onClick={() => {
                alert("🎤 Voice search is active and ready. Start speaking...");
              }}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-full transition"
              title="Search by voice"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#4285F4"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#34A853"/>
              </svg>
            </button>

            {/* Google-like Lens Camera Icon */}
            <button
              type="button"
              onClick={() => {
                alert("📸 Image visual search is active. Choose or drop a grocery photo to search.");
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-full transition"
              title="Search by image (Lens)"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#EA4335" />
                <circle cx="12" cy="13" r="4" stroke="#FBBC05" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dynamic recommendation keywords below search */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-gray-500">
          <span className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Popular searches:</span>
          {['Fresh Mango', 'Organic Milk', 'Brown Bread', 'Paneer'].map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => setSearchQuery(keyword)}
              className="px-3 py-0.5 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200/60 rounded-full text-gray-600 transition"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Category Icons Bar - Flipkart Grocery Style */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-x-auto scrollbar-none" id="categories-shortcut-bar">
        <div className="flex justify-between items-center min-w-[760px] gap-4">
          
          {/* "All" Category Badge */}
          <button
            onClick={() => setSelectedCategory('All')}
            className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none flex-1"
            id="cat-shortcut-all"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              selectedCategory === 'All' 
                ? 'bg-[#2874f0] text-white ring-4 ring-blue-100 scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-[#2874f0]'
            }`}>
              <Sparkles className="h-6 w-6" />
            </div>
            <span className={`text-xs font-semibold tracking-tight transition-colors ${
              selectedCategory === 'All' ? 'text-[#2874f0] font-bold' : 'text-gray-700'
            }`}>
              All Items
            </span>
          </button>

          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            
            // Render nice mini icons for categories
            const getCategoryIcon = (category: string) => {
              switch (category) {
                case 'Fruits & Vegetables': return '🍎';
                case 'Dairy & Eggs': return '🥛';
                case 'Pantry & Staples': return '🌾';
                case 'Bakery & Bread': return '🍞';
                case 'Beverages': return '🥤';
                case 'Snacks & Sweets': return '🍫';
                case 'Household Supplies': return '🧼';
                case 'Personal Care': return '🧴';
                default: return '🛍️';
              }
            };

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none flex-1"
                id={`cat-shortcut-${idx}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[#2874f0] ring-4 ring-blue-100 scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                }`}>
                  {getCategoryIcon(cat)}
                </div>
                <span className={`text-xs font-semibold text-center tracking-tight truncate w-24 transition-colors ${
                  isSelected ? 'text-[#2874f0] font-bold' : 'text-gray-700'
                }`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Offer Banner Slider */}
      {searchQuery === '' && (
        <div className="relative rounded-xl overflow-hidden shadow-sm mb-8 h-40 md:h-48" id="offer-banners">
          {offers.map((offer, idx) => (
            <div
              key={offer.id}
              className={`absolute inset-0 bg-gradient-to-r ${offer.bg} text-white p-6 md:p-8 flex flex-col justify-center transition-all duration-500 ease-in-out ${
                idx === activeOffer ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className="max-w-md">
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                  Local Store Deal
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1 mb-2 leading-tight">
                  {offer.title}
                </h2>
                <p className="text-sm md:text-base text-white/90 font-medium">
                  {offer.desc}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-yellow-400 text-gray-900 font-extrabold px-3 py-1 rounded-sm shadow-sm">
                    CODE: {offer.tag}
                  </span>
                  <span className="text-xs text-white/80 font-semibold flex items-center gap-0.5">
                    Tap to apply <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Indicator dots */}
          <div className="absolute bottom-3 right-6 flex gap-1.5 z-10">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveOffer(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === activeOffer ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="catalog-toolbar">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-1.5" id="current-category-title">
            {selectedCategory === 'All' ? 'All Groceries & Staples' : selectedCategory}
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-mono">
              {processedProducts.length} {processedProducts.length === 1 ? 'item' : 'items'} found
            </span>
          </h2>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-0.5">
              Showing search results for &ldquo;<span className="font-semibold text-[#2874f0]">{searchQuery}</span>&rdquo;
            </p>
          )}
        </div>

        {/* Sort Actions */}
        <div className="flex items-center gap-2 text-sm text-gray-700" id="sorting-panel">
          <span className="text-gray-500 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort By:
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'popular', label: 'Popular' },
              { id: 'priceAsc', label: 'Price: Low to High' },
              { id: 'priceDesc', label: 'Price: High to Low' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition ${
                  sortBy === option.id
                    ? 'bg-blue-50 border-blue-200 text-[#2874f0]'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {processedProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm" id="empty-catalog-state">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Products Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            We couldn't find any groceries in this view. Try changing your search keywords or choosing another category!
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2874f0] hover:bg-blue-600 rounded shadow"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6" id="products-grid">
          {processedProducts.map((product) => {
            const quantity = cart[product.id] || 0;
            const discount = getDiscountPercentage(product.price, product.originalPrice);
            const isLowStock = product.stock > 0 && product.stock <= 10;
            const isOutOfStock = product.stock <= 0;

            return (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.015 }}
                onClick={() => onProductClick?.(product)}
                className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer"
                id={`product-card-${product.id}`}
              >

                {/* Excel S.No. Badge */}
                <span className="absolute top-2 right-2 z-10 bg-gray-950/80 hover:bg-gray-950 text-white text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded shadow-sm font-mono tracking-tight">
                  S.No. {getSerialNumber(product.id)}
                </span>

                {/* Stock Tag */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded shadow">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Image Section */}
                <div className="h-40 md:h-48 relative overflow-hidden bg-gray-50 p-2 border-b border-gray-100 flex items-center justify-center">
                  <ProductPlaceholderImage
                    image={product.image}
                    name={product.name}
                    category={product.category}
                    className="w-full h-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Immediate Image Upload Overlay */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRefs.current[product.id]?.click();
                        }}
                        className="bg-white/95 hover:bg-white text-gray-800 text-[11px] font-bold px-2.5 py-1.5 rounded shadow flex items-center gap-1 transition"
                        title="Upload fresh photo"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#2874f0]" />
                        <span>Upload Photo</span>
                      </button>
                      <span className="text-[9px] text-white/90">Click to upload photo</span>
                      <input
                        type="file"
                        ref={(el) => { fileInputRefs.current[product.id] = el; }}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleCardImageUpload(product.id, e)}
                      />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Size & Category Tag */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-[#2874f0] text-white font-black px-1.5 py-0.5 rounded font-mono shadow-sm" title={`Excel Product S.No. ${getSerialNumber(product.id)}`}>
                          #{getSerialNumber(product.id)}
                        </span>
                        <span className="text-[10px] font-bold tracking-tight text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {product.unit}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-500 font-semibold truncate max-w-[100px]">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 leading-tight min-h-[32px] md:min-h-[40px] group-hover:text-[#2874f0] transition-colors">
                      {product.name}
                    </h3>

                    {/* Stock indicator */}
                    {isLowStock && (
                      <p className="text-[10px] font-semibold text-rose-500 mt-1">
                        Only {product.stock} items left!
                      </p>
                    )}
                  </div>

                  {/* Pricing and Cart Actions */}
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm md:text-base font-extrabold text-gray-900">
                        ₹{product.price}
                      </span>
                    </div>

                    {/* Flipkart-style quantity controls */}
                    <div className="mt-3">
                      {quantity === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          disabled={isOutOfStock}
                          className="w-full bg-[#ff9f00] hover:bg-[#f39500] text-white font-extrabold text-xs md:text-sm py-1.5 px-3 rounded shadow-sm flex items-center justify-center gap-1 border border-[#ff9f00] hover:shadow-md transition active:scale-[0.98] disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none"
                          id={`add-btn-${product.id}`}
                        >
                          <span>ADD TO CART</span>
                        </button>
                      ) : (
                        <div 
                          className="flex items-center w-full border border-orange-400 rounded overflow-hidden" 
                          id={`qty-counter-${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromCart(product);
                            }}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold px-3 py-1.5 text-xs md:text-sm flex-1 text-center select-none active:bg-orange-200 transition"
                            id={`qty-minus-${product.id}`}
                          >
                            &minus;
                          </button>
                          <span className="text-xs md:text-sm font-extrabold text-orange-700 bg-white px-2 py-1.5 flex-1 text-center select-none">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            disabled={quantity >= product.stock}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold px-3 py-1.5 text-xs md:text-sm flex-1 text-center select-none active:bg-orange-200 transition disabled:opacity-50 disabled:pointer-events-none"
                            id={`qty-plus-${product.id}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
