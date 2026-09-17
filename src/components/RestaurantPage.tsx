import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, RESTAURANT_CATEGORIES } from '../types';
import { RESTAURANT_MENU_ITEMS } from '../data/restaurantMenu';
import { fetchGoogleSheetMenu, DEFAULT_SHEET_CSV_URL } from '../data/googleSheetMenuService';
import { Search, Utensils, Flame, Clock, Star, Plus, Minus, ShoppingCart, Sparkles, Filter, CheckCircle2, PhoneCall, RefreshCw, Table, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductPlaceholderImage from './ProductPlaceholderImage';
import storefrontImg from '../assets/images/bari_storefront_1784447298609.jpg';

interface RestaurantPageProps {
  cart: { [productId: string]: number };
  onAddToCart: (product: MenuItem) => void;
  onRemoveFromCart: (product: MenuItem) => void;
  onOpenCart: () => void;
  pincode: string;
}

export default function RestaurantPage({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  pincode
}: RestaurantPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(RESTAURANT_MENU_ITEMS);
  const [categoriesList, setCategoriesList] = useState<string[]>(Array.from(RESTAURANT_CATEGORIES));
  const [selectedCategory, setSelectedCategory] = useState<string>('All Dishes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'specials'>('all');

  // Google Sheet Sync states
  const [sheetUrl, setSheetUrl] = useState<string>(DEFAULT_SHEET_CSV_URL);
  const [isLoadingSheet, setIsLoadingSheet] = useState<boolean>(true);
  const [sheetSource, setSheetSource] = useState<'sheet' | 'fallback'>('fallback');
  const [syncStatus, setSyncStatus] = useState<string>('Syncing menu from Google Sheet...');
  const [showSheetSettings, setShowSheetSettings] = useState<boolean>(false);

  // Load Google Sheet Menu
  const loadSheetMenu = async (urlToFetch = sheetUrl) => {
    setIsLoadingSheet(true);
    setSyncStatus('Fetching live menu from Google Sheet...');
    
    const result = await fetchGoogleSheetMenu(urlToFetch);
    
    setMenuItems(result.items);
    if (result.categories && result.categories.length > 0) {
      setCategoriesList(result.categories);
    }
    setSheetSource(result.source);
    
    if (result.source === 'sheet') {
      setSyncStatus(`Connected to Live Google Sheet (${result.items.length} dishes synced)`);
    } else {
      setSyncStatus(`Offline mode: Loaded ${result.items.length} default menu items (${result.error || ''})`);
    }
    
    setIsLoadingSheet(false);
  };

  useEffect(() => {
    loadSheetMenu();
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      if (selectedCategory !== 'All Dishes' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Veg only match
      if (vegOnly && !item.isVeg) {
        return false;
      }
      // Specials tab match
      if (activeTab === 'specials' && !item.isChefSpecial) {
        return false;
      }
      // Search match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query) || false;
        const matchCategory = item.category.toLowerCase().includes(query);
        return matchName || matchDesc || matchCategory;
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, vegOnly, activeTab]);

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans" id="restaurant-page">
      
      {/* 🍲 Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white shadow-2xl mb-8 border border-amber-800/40">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Background Decorative Blur circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3 text-center md:text-left">
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider">
                <Utensils className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                <span>Bari' Cafe & Restaurant • 2nd Floor</span>
              </div>

              {/* Live Sheet Status Indicator */}
              <div 
                onClick={() => setShowSheetSettings(!showSheetSettings)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 rounded-full text-emerald-300 text-[11px] font-bold cursor-pointer transition shadow-xs"
                title="Click to view Google Sheet CSV settings"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>{sheetSource === 'sheet' ? 'Google Sheet Synced' : 'Sheet Offline'}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-serif leading-tight">
              Fresh Hot Meals, Thalis <br />
              <span className="text-amber-400 italic font-sans">& Fast Food Kitchen</span>
            </h1>

            <p className="text-amber-100/80 text-sm md:text-base font-normal leading-relaxed">
              Order fresh North Indian Thalis, Pizzas, Amritsari Chole Bhature, Momos, Chai & Shakes! Live menu synced directly from our Google Sheet kitchen menu. Dine-in at 2nd floor or door delivery in Pincode <span className="font-bold text-amber-300 font-mono">{pincode}</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs font-semibold text-amber-200">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-400" />
                Cooking Time: 10-20 Mins
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                4.9 ★ Rating (1,200+ Foodies)
              </span>
              <button
                onClick={() => loadSheetMenu()}
                disabled={isLoadingSheet}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 px-3 py-1.5 rounded-lg border border-amber-300 font-extrabold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSheet ? 'animate-spin' : ''}`} />
                <span>{isLoadingSheet ? 'Syncing...' : 'Sync Menu'}</span>
              </button>
            </div>

          </div>

          {/* Right Image / Badge Box */}
          <div className="relative w-full md:w-80 h-52 md:h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400/40 flex-shrink-0 group">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" 
              alt="Bari Restaurant Food"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-white">Google Sheet Kitchen Sync</p>
                <p className="text-[10px] text-emerald-300 font-mono">{menuItems.length} Dishes Loaded</p>
              </div>
              <span className="px-2 py-1 bg-amber-500 text-gray-900 font-black rounded text-[10px] uppercase">
                Now Serving
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 📊 Google Sheet URL Sync Info / Settings Bar */}
      {showSheetSettings && (
        <div className="bg-amber-950/90 text-amber-100 border border-amber-800 rounded-xl p-4 mb-6 shadow-md animate-in fade-in zoom-in-98 duration-150">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Google Sheet CSV Sync Configuration
            </h4>
            <button 
              onClick={() => setShowSheetSettings(false)}
              className="text-xs font-bold text-amber-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs text-amber-200/90 mb-3">
            Your restaurant menu is automatically loaded from Google Sheet CSV export.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste Google Sheet CSV Export URL here..."
              className="flex-1 px-3 py-2 bg-amber-900/60 border border-amber-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              onClick={() => loadSheetMenu(sheetUrl)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSheet ? 'animate-spin' : ''}`} />
              <span>Update & Sync</span>
            </button>
          </div>
          <p className="text-[10px] text-amber-300/80 mt-2 italic flex items-center gap-1">
            <span>Status:</span>
            <strong className="font-mono text-emerald-300">{syncStatus}</strong>
          </p>
        </div>
      )}

      {/* 🔍 Search & Quick Tabs Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4" id="restaurant-search-toolbar">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search dishes (e.g., Margherita Pizza, Momos, Chai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
            id="restaurant-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and View Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Chef Special Filter */}
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Menu ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('specials')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                activeTab === 'specials'
                  ? 'bg-amber-500 text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-900" />
              Chef Specials
            </button>
          </div>

          {/* Veg Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-lg select-none hover:bg-emerald-100 transition">
            <div className="h-4 w-4 border-2 border-emerald-600 flex items-center justify-center p-0.5 rounded-xs">
              <div className="h-2 w-2 bg-emerald-600 rounded-full" />
            </div>
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="sr-only"
            />
            <span>100% Veg</span>
          </label>

          {/* Cart Drawer Trigger */}
          {totalCartCount > 0 && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-xs font-black shadow-sm transition"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart ({totalCartCount})</span>
            </button>
          )}

        </div>

      </div>

      {/* 🏷️ Restaurant Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar" id="restaurant-categories-list">
        {categoriesList.map((category) => {
          const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-amber-900 text-amber-200 border-amber-800 shadow-md scale-102'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200'
              }`}
            >
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {/* 🔄 Loading Spinner when syncing sheet */}
      {isLoadingSheet ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm my-8 flex flex-col items-center justify-center">
          <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mb-4" />
          <h3 className="text-base font-extrabold text-gray-800">Loading Restaurant Menu from Google Sheet...</h3>
          <p className="text-xs text-gray-500 mt-1">Fetching live dishes, prices, and categories</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm my-8">
          <Utensils className="h-12 w-12 text-amber-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No dishes found in this filter</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Try resetting your search query or choosing another menu category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All Dishes');
              setSearchQuery('');
              setVegOnly(false);
              setActiveTab('all');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-extrabold text-xs rounded-lg shadow transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="restaurant-items-grid">
          {filteredItems.map((item) => {
            const quantityInCart = cart[item.id] || 0;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group relative"
                id={`menu-item-${item.id}`}
              >
                {/* Food Image Container */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Pure Veg Green Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md border border-gray-200/80 shadow-xs flex items-center gap-1 text-[10px] font-bold text-gray-800">
                    <div className="h-3.5 w-3.5 border border-emerald-600 flex items-center justify-center p-0.5 rounded-xs">
                      <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full" />
                    </div>
                    <span>Veg</span>
                  </div>

                  {/* Chef Special Tag */}
                  {item.isChefSpecial && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Special
                    </span>
                  )}

                  {/* Prep Time & Spicy Level Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                      <Clock className="h-3 w-3 text-amber-400" />
                      {item.prepTime || '15 mins'}
                    </span>
                    {item.spicyLevel && (
                      <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-amber-300">
                        <Flame className="h-3 w-3 text-orange-400" />
                        {item.spicyLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating & Category */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.rating && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {item.rating} ({item.reviewsCount})
                        </span>
                      )}
                    </div>

                    {/* Dish Title */}
                    <h3 className="font-extrabold text-gray-900 text-sm leading-snug mb-1 group-hover:text-amber-800 transition">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-gray-900 font-mono">
                          ₹{item.price}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through font-mono">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">{item.unit}</p>
                    </div>

                    {/* Add / Quantity Counter Button */}
                    {quantityInCart === 0 ? (
                      <button
                        onClick={() => onAddToCart(item)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs rounded-xl shadow-xs transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-amber-900 text-amber-100 rounded-xl overflow-hidden shadow-xs border border-amber-800 font-bold text-xs">
                        <button
                          onClick={() => onRemoveFromCart(item)}
                          className="px-2.5 py-2 hover:bg-amber-800 transition cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2.5 font-mono font-black text-white">
                          {quantityInCart}
                        </span>
                        <button
                          onClick={() => onAddToCart(item)}
                          className="px-2.5 py-2 hover:bg-amber-800 transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 📲 Quick WhatsApp Food Order Floating Info Banner */}
      <div className="mt-12 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-base flex items-center justify-center md:justify-start gap-2">
            <span>🛵 Prefer Instant WhatsApp Food Ordering?</span>
          </h4>
          <p className="text-xs text-emerald-200 leading-relaxed max-w-xl">
            You can also place quick direct food orders or book a 2nd Floor table reservation by contacting our hotline on WhatsApp!
          </p>
        </div>
        <a
          href="https://wa.me/917500236520?text=Hi%20Bari%20Restaurant,%20I%20would%20like%20to%20order%20food"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <span>💬 Order via WhatsApp (+91 75002 36520)</span>
        </a>
      </div>

    </div>
  );
}
