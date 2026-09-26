import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, CafeCartItem } from './types';
import { fetchMenuData, getCategoryIcon } from './services/menuService';
import { ZomatoHeader, GOOGLE_MAPS_URL, CAFE_FULL_ADDRESS } from './components/ZomatoHeader';
import ZomatoBanner from './components/ZomatoBanner';
import CircularCategoryBar from './components/CircularCategoryBar';
import HorizontalDishesRow from './components/HorizontalDishesRow';
import ZomatoDishCard from './components/ZomatoDishCard';
import MenuSkeleton from './components/MenuSkeleton';
import ErrorAlert from './components/ErrorAlert';
import VideoModal from './components/VideoModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import ProfileModal from './components/ProfileModal';
import CafeCartDrawer from './components/CafeCartDrawer';
import CafeNavigationBar from './components/CafeNavigationBar';
import CartToast, { ToastPayload } from './components/CartToast';
import {
  loadCartFromStorage,
  saveCartToStorage,
  calculateCartSummary,
  getItemBasePrice,
  getCartItemId,
} from './services/cartService';
import { UserProfile, getCurrentUser } from './services/authService';
import { SearchX, ArrowUp, Sparkles, Play, Flame, Zap, CheckCircle2, MapPin } from 'lucide-react';

export const App: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [fromCache, setFromCache] = useState<boolean>(false);

  // User Profile & Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Cart State & Cart Drawer
  const [cartItems, setCartItems] = useState<CafeCartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'cart' | 'profile'>('home');
  const [cartToast, setCartToast] = useState<ToastPayload | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'reels' | 'popular' | 'fast'>('all');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Video modal state
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; name: string }>({
    isOpen: false,
    url: '',
    name: '',
  });

  // Image preview modal state
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; url: string; name: string }>({
    isOpen: false,
    url: '',
    name: '',
  });

  // Persist cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  // Cart summary calculations
  const { totalItems: cartCount, grandTotal: cartTotalAmount } = useMemo(
    () => calculateCartSummary(cartItems),
    [cartItems]
  );

  // Fetch menu data from Google Sheet
  const loadMenu = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fetchMenuData();
      setItems(result.items);
      setLastSyncedTime(result.timestamp);
      setFromCache(result.fromCache);
    } catch (err: any) {
      console.error('Failed to load menu data:', err);
      setError(err?.message || 'Could not connect to Google Sheets. Please verify connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Track scroll position for "Back to top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Distinct categories in the order they appear
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Spotlight items for the Horizontal Scroll Row
  const spotlightItems = useMemo(() => {
    if (items.length === 0) return [];
    const withVideos = items.filter((i) => i.videoUrl && i.videoUrl.trim().length > 0);
    const signaturePicks = items.filter(
      (i) =>
        i.name.toLowerCase().includes('pizza') ||
        i.name.toLowerCase().includes('burger') ||
        i.name.toLowerCase().includes('shake') ||
        i.name.toLowerCase().includes('mojito') ||
        i.name.toLowerCase().includes('coffee')
    );

    const combined = [...withVideos, ...signaturePicks];
    const uniqueIds = new Set<string | number>();
    const result: MenuItem[] = [];

    for (const item of combined) {
      if (!uniqueIds.has(item.id)) {
        uniqueIds.add(item.id);
        result.push(item);
      }
      if (result.length >= 10) break;
    }

    return result.length > 0 ? result : items.slice(0, 8);
  }, [items]);

  // Filtered items based on Category, Search Query, and Quick Chips
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      if (activeFilter === 'reels' && (!item.videoUrl || item.videoUrl.trim().length === 0)) {
        return false;
      }
      if (activeFilter === 'popular' && (Number(item.id) || 1) % 2 !== 0 && !item.videoUrl) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesNotes = item.notes ? item.notes.toLowerCase().includes(query) : false;
        return matchesName || matchesCategory || matchesNotes;
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery, activeFilter]);

  // Group items by category when in 'All' view and not searching / filter active
  const groupedItems = useMemo(() => {
    if (selectedCategory !== 'All' || searchQuery.trim().length > 0 || activeFilter !== 'all') {
      return null;
    }

    const groups: { category: string; items: MenuItem[] }[] = [];
    categories.forEach((cat) => {
      const catItems = items.filter((item) => item.category === cat);
      if (catItems.length > 0) {
        groups.push({ category: cat, items: catItems });
      }
    });
    return groups;
  }, [items, selectedCategory, searchQuery, activeFilter, categories]);

  // ================= CART ACTION HANDLERS =================
  const handleAddToCart = useCallback(
    (item: MenuItem, variant?: string, price?: number) => {
      const finalPrice = price || getItemBasePrice(item, variant);
      const cartItemId = getCartItemId(item.id, variant);

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((ci) => ci.cartItemId === cartItemId);
        if (existingIdx > -1) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: next[existingIdx].quantity + 1,
          };
          return next;
        }
        return [
          ...prev,
          {
            cartItemId,
            item,
            variant: variant || 'Standard',
            price: finalPrice,
            quantity: 1,
          },
        ];
      });

      // Show Toast Notification
      const newTotalItems = cartCount + 1;
      const newTotalAmount = cartTotalAmount + finalPrice;

      setCartToast({
        id: Date.now(),
        item,
        variant,
        price: finalPrice,
        quantityAdded: 1,
        totalCartItems: newTotalItems,
        cartTotalAmount: newTotalAmount,
      });
    },
    [cartCount, cartTotalAmount]
  );

  const handleUpdateCartQuantity = useCallback((cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.cartItemId === cartItemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CafeCartItem[];
    });
  }, []);

  const handleUpdateItemQuantity = useCallback(
    (item: MenuItem, delta: number) => {
      const cleanId = String(item.id).replace(/\s+/g, '-');
      if (delta > 0) {
        handleAddToCart(item);
      } else {
        // Find existing cart item matching this item id and decrement
        const target = cartItems.find(
          (ci) => String(ci.item.id).replace(/\s+/g, '-') === cleanId
        );
        if (target) {
          handleUpdateCartQuantity(target.cartItemId, -1);
        }
      }
    },
    [cartItems, handleAddToCart, handleUpdateCartQuantity]
  );

  const handleRemoveItem = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.cartItemId !== cartItemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (itemId: string | number): number => {
      const cleanId = String(itemId).replace(/\s+/g, '-');
      return cartItems
        .filter((ci) => String(ci.item.id).replace(/\s+/g, '-') === cleanId)
        .reduce((sum, ci) => sum + ci.quantity, 0);
    },
    [cartItems]
  );

  // ================= NAVIGATION HANDLERS =================
  const handleGoHome = useCallback(() => {
    setActiveNavTab('home');
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveFilter('all');
    setIsCartOpen(false);
    setIsProfileOpen(false);
    scrollToTop();
  }, []);

  const handleOpenCart = useCallback(() => {
    setActiveNavTab('cart');
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setIsCartOpen(false);
    setActiveNavTab('home');
  }, []);

  const handleOpenProfile = useCallback(() => {
    setActiveNavTab('profile');
    setIsProfileOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setIsProfileOpen(false);
    setActiveNavTab('home');
  }, []);

  const handleOpenVideo = (videoUrl: string, itemName: string) => {
    setVideoModal({
      isOpen: true,
      url: videoUrl,
      name: itemName,
    });
  };

  const handleCloseVideo = () => {
    setVideoModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-rose-100 dark:selection:bg-rose-900/40 selection:text-rose-900 dark:selection:text-rose-200 overflow-x-hidden w-full max-w-full pb-18 sm:pb-12 transition-colors duration-200">
      {/* 1. Zomato Top Header (Brand, Location, Search Bar, Dark/Light Mode, Profile) */}
      <ZomatoHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenProfile={handleOpenProfile}
        onGoHome={handleGoHome}
        onOpenCart={handleOpenCart}
        cartCount={cartCount}
        activeTab={activeNavTab}
      />

      {/* 2. Zomato Banner (Promotional Gold / Cafe Delights Banner) */}
      <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 overflow-hidden">
        <ZomatoBanner />
      </div>

      {/* 3. Circular Category Bar (Side-scrollable circular dish avatars with active indicator) */}
      {!loading && !error && items.length > 0 && (
        <CircularCategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveFilter('all');
          }}
        />
      )}

      {/* 4. Quick Filter Chips (Zomato-style Pill Filters) */}
      {!loading && !error && items.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 mt-3 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full min-w-0">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Items</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('reels')}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'reels'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
              <span>With Videos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('popular')}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'popular'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Chef's Choice</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('fast')}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'fast'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span>Near & Fast</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 py-4">
        {/* Loading Skeleton */}
        {loading && <MenuSkeleton />}

        {/* Error State */}
        {!loading && error && (
          <ErrorAlert
            message={error}
            onRetry={() => loadMenu(false)}
            isRetrying={loading || isRefreshing}
          />
        )}

        {/* 5. SIDE SCROLL (HORIZONTAL SCROLL): RECOMMENDED FOR YOU */}
        {!loading && !error && !searchQuery && selectedCategory === 'All' && activeFilter === 'all' && (
          <HorizontalDishesRow
            title="Recommended For You"
            subtitle="Side scroll to explore hand-crafted chef specialties & popular cafe favorites"
            items={spotlightItems}
            onOpenVideo={handleOpenVideo}
            onPreviewImage={(url, name) => setPreviewModal({ isOpen: true, url, name })}
            onAddToCart={handleAddToCart}
            getItemQuantity={getItemQuantity}
            onUpdateQuantity={handleUpdateItemQuantity}
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md mx-auto shadow-xs my-8 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
              No Dishes Found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
              We couldn't find any dishes matching your selection. Try clearing your search or filter.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs hover:bg-rose-700 transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white font-bold text-xs shadow-xs hover:bg-stone-800 dark:hover:bg-stone-700 transition-all cursor-pointer"
                >
                  Show All Categories
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. VERTICAL SCROLL: DISHES FEED (By Category or Filtered Grid) */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="my-6">
            {/* If All Categories are selected & no active search/chip: Display categorized vertical sections */}
            {groupedItems ? (
              <div className="space-y-12">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-900 dark:bg-rose-500"></span>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-stone-900 dark:text-white">
                      Explore Full Menu
                    </h2>
                  </div>
                  <span className="text-xs text-stone-400 font-semibold">
                    Scroll down for all categories
                  </span>
                </div>

                {groupedItems.map((group) => {
                  const icon = getCategoryIcon(group.category);
                  return (
                    <section
                      key={group.category}
                      id={`section-${group.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      className="scroll-mt-24"
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between pb-2 mb-4 border-b border-stone-200/90 dark:border-stone-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1 rounded-lg bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-750">
                            {icon}
                          </span>
                          <div>
                            <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white font-display">
                              {group.category}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                              Fresh cafe delicacies
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCategory(group.category)}
                          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 px-3 py-1 rounded-full transition-colors cursor-pointer"
                        >
                          View Only {group.category}
                        </button>
                      </div>

                      {/* Items Grid (Vertically Scrolling) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {group.items.map((item) => (
                          <ZomatoDishCard
                            key={item.id}
                            item={item}
                            onOpenVideo={handleOpenVideo}
                            onPreviewImage={(url, name) =>
                              setPreviewModal({ isOpen: true, url, name })
                            }
                            onAddToCart={handleAddToCart}
                            cartQuantity={getItemQuantity(item.id)}
                            onUpdateQuantity={(delta) => handleUpdateItemQuantity(item, delta)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              /* Flat Grid when filtered by category, search, or chip */
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getCategoryIcon(selectedCategory)}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-display">
                      {selectedCategory === 'All'
                        ? searchQuery
                          ? `Results for "${searchQuery}"`
                          : 'Special Filtered Dishes'
                        : selectedCategory}
                    </h2>
                  </div>

                  {selectedCategory !== 'All' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 px-3 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>

                {/* Vertically Scrolling Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredItems.map((item) => (
                    <ZomatoDishCard
                      key={item.id}
                      item={item}
                      onOpenVideo={handleOpenVideo}
                      onPreviewImage={(url, name) =>
                        setPreviewModal({ isOpen: true, url, name })
                      }
                      onAddToCart={handleAddToCart}
                      cartQuantity={getItemQuantity(item.id)}
                      onUpdateQuantity={(delta) => handleUpdateItemQuantity(item, delta)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 mt-12 py-8 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200 text-sm">
            <span>Friends 4 Ever Coffee Cafe</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Pure Veg
            </span>
          </div>

          {/* Clickable Address Link to Google Maps */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={`View on Google Maps: ${CAFE_FULL_ADDRESS}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-xs font-medium max-w-xl text-center"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span className="truncate">{CAFE_FULL_ADDRESS}</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">Open in Maps ↗</span>
          </a>

          <p className="text-stone-400 dark:text-stone-500 text-[11px]">
            Live Digital Menu connected with Google Sheets • Real-time Updates
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-[11px] mt-0.5">
            © {new Date().getFullYear()} Friends 4 Ever Coffee Cafe. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          id="btn-scroll-top"
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 p-2.5 sm:p-3 rounded-full bg-stone-900 text-white shadow-lg hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-stone-700"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* ================= NAVIGATION BAR (Home, Cart Section, Profile Section) ================= */}
      <CafeNavigationBar
        activeTab={activeNavTab}
        cartCount={cartCount}
        cartTotalAmount={cartTotalAmount}
        onGoHome={handleGoHome}
        onOpenCart={handleOpenCart}
        onOpenProfile={handleOpenProfile}
        currentUser={currentUser}
      />

      {/* ================= CART SECTION DRAWER ================= */}
      <CafeCartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onOpenProfile={handleOpenProfile}
      />

      {/* ================= ADD TO CART NOTIFICATION TOAST ================= */}
      <CartToast
        toast={cartToast}
        onClose={() => setCartToast(null)}
        onOpenCart={handleOpenCart}
      />

      {/* Video / Reel Player Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        videoUrl={videoModal.url}
        itemName={videoModal.name}
        onClose={handleCloseVideo}
      />

      {/* Image Zoom Preview Modal */}
      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        imageUrl={previewModal.url}
        itemName={previewModal.name}
        onClose={() => setPreviewModal({ isOpen: false, url: '', name: '' })}
      />

      {/* User Profile, Sign Up & Login Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user) {
            setTimeout(() => {
              handleCloseProfile();
            }, 700);
          }
        }}
      />
    </div>
  );
};

export default App;
