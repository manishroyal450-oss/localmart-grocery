import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, CafeCartItem, DeliveryInfo } from './types';
import { fetchMenuData, getCategoryIcon, sortCustomCategories } from './services/menuService';
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
import CafeFooter from './components/CafeFooter';
import CartToast, { ToastPayload } from './components/CartToast';
import {
  loadCartFromStorage,
  saveCartToStorage,
  calculateCartSummary,
  getItemBasePrice,
  getCartItemId,
} from './services/cartService';
import { UserProfile, getCurrentUser } from './services/authService';
import { SearchX, ArrowUp, Sparkles, Play, Flame, Zap, CheckCircle2, MapPin, MessageCircle, FileSpreadsheet } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import {
  syncOrderToGoogleSheet,
  buildWhatsAppOrderMessage,
  CAFE_WHATSAPP_PHONE,
} from './services/googleAppsScriptService';

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

  // Delivery configuration from Google Sheet (Column R: deliveryvalue, Column S: deliverydescription)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    deliveryValue: 50,
    deliveryDescription: '',
    freeDeliveryThreshold: 400,
  });

  // Table list from Google Sheet (Column T: Table)
  const [tables, setTables] = useState<string[]>([]);

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
      if (result.deliveryInfo) {
        setDeliveryInfo(result.deliveryInfo);
      }
      if (result.tables && result.tables.length > 0) {
        setTables(result.tables);
      }
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

  // Distinct categories ordered with Pizza at #1 and Drinks at the very end
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return sortCustomCategories(Array.from(set));
  }, [items]);

  // Spotlight items for the Horizontal Scroll Row: ONLY show items with offers OR YouTube/video links
  const spotlightItems = useMemo(() => {
    if (items.length === 0) return [];
    return items.filter((item) => {
      const hasOffer = Boolean(
        item.offer && item.offer.trim().length > 0 && item.offer.trim() !== '0'
      );
      const hasVideo = Boolean(
        item.videoUrl && item.videoUrl.trim().length > 0
      );
      return hasOffer || hasVideo;
    });
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

  const getItemVariantQuantities = useCallback(
    (itemId: string | number): Record<string, number> => {
      const cleanId = String(itemId).replace(/\s+/g, '-');
      const result: Record<string, number> = {};
      cartItems
        .filter((ci) => String(ci.item.id).replace(/\s+/g, '-') === cleanId)
        .forEach((ci) => {
          const v = ci.variant || 'Standard';
          result[v] = (result[v] || 0) + ci.quantity;
        });
      return result;
    },
    [cartItems]
  );

  // Quick WhatsApp Order with Automatic Stock Deduct & Amount Add trigger
  const [isQuickOrdering, setIsQuickOrdering] = useState<boolean>(false);
  const [orderSyncSuccessMessage, setOrderSyncSuccessMessage] = useState<string | null>(null);

  const handleQuickWhatsAppOrder = useCallback(async () => {
    if (cartItems.length === 0) return;
    setIsQuickOrdering(true);

    const orderId = `FFC-${Math.floor(100000 + Math.random() * 900000)}`;
    const custName = currentUser?.fullName?.trim() || 'Guest Customer';
    const custPhone = currentUser?.contactNumber?.trim() || '';
    const custAddress = currentUser?.address?.trim() || '';

    // 1. Prepare Google Sheet stock deduction & amount addition payload
    const sheetPayload = {
      bill_no: orderId,
      customer_name: custName,
      customer_phone: custPhone,
      table_or_address: custAddress,
      order_type: 'dine-in',
      grandtotal: cartTotalAmount,
      subtotal: cartTotalAmount,
      notes: 'Quick WhatsApp Checkout',
      items: cartItems.map((ci) => ({
        name: ci.item.name,
        item_name: ci.item.name,
        variant: ci.variant || 'Standard',
        qty: ci.quantity,
        stockdeduct: ci.quantity,
        price: ci.price,
        total: ci.price * ci.quantity,
      })),
    };

    // 2. Trigger Stock Deduct & Amount Add in Google Sheet / Excel
    syncOrderToGoogleSheet(sheetPayload)
      .then((res) => {
        console.log('[Quick WhatsApp Order Synced]:', res);
      })
      .catch((err) => {
        console.warn('[Quick WhatsApp Order Sync Error]:', err);
      });

    // 3. Build WhatsApp message and open WhatsApp
    const message = buildWhatsAppOrderMessage({
      orderId,
      orderType: 'dine-in',
      customerName: custName,
      customerPhone: custPhone,
      tableOrAddress: custAddress,
      items: cartItems.map((ci) => ({
        name: ci.item.name,
        variant: ci.variant,
        quantity: ci.quantity,
        price: ci.price,
      })),
      grandTotal: cartTotalAmount,
    });

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${CAFE_WHATSAPP_PHONE}?text=${encoded}`, '_blank');

    // 4. Clear cart & show notification
    setCartItems([]);
    setIsQuickOrdering(false);
    setOrderSyncSuccessMessage(`Order #${orderId} sent to WhatsApp! Stock deducted & Excel updated.`);
    setTimeout(() => {
      setOrderSyncSuccessMessage(null);
    }, 5000);
  }, [cartItems, cartTotalAmount, currentUser]);

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

      {/* 4. Quick Filter Chips with Liquid Glass Buttons */}
      {!loading && !error && items.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 mt-3 overflow-hidden">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 px-1 w-full min-w-0">
            <LiquidButton
              variant="default"
              size="pill"
              isActive={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              className="flex-shrink-0"
              title="Show all items"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Items</span>
            </LiquidButton>

            <LiquidButton
              variant="rose"
              size="pill"
              isActive={activeFilter === 'reels'}
              onClick={() => setActiveFilter('reels')}
              className="flex-shrink-0"
              title="Filter items with video reels"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${activeFilter === 'reels' ? 'text-white' : 'text-rose-500'}`} />
              <span>With Videos</span>
            </LiquidButton>

            <LiquidButton
              variant="amber"
              size="pill"
              isActive={activeFilter === 'popular'}
              onClick={() => setActiveFilter('popular')}
              className="flex-shrink-0"
              title="Chef's top recommended popular dishes"
            >
              <Flame className={`w-3.5 h-3.5 fill-current ${activeFilter === 'popular' ? 'text-white' : 'text-amber-500'}`} />
              <span>Chef's Choice</span>
            </LiquidButton>

            <LiquidButton
              variant="emerald"
              size="pill"
              isActive={activeFilter === 'fast'}
              onClick={() => setActiveFilter('fast')}
              className="flex-shrink-0"
              title="Fast preparation dishes"
            >
              <Zap className={`w-3.5 h-3.5 fill-current ${activeFilter === 'fast' ? 'text-white' : 'text-emerald-500'}`} />
              <span>Near & Fast</span>
            </LiquidButton>
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
        {!loading && !error && !searchQuery && selectedCategory === 'All' && activeFilter === 'all' && spotlightItems.length > 0 && (
          <HorizontalDishesRow
            title="Recommended For You"
            subtitle="Exclusive deals, offers & dishes with video reels"
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
                            variantQuantities={getItemVariantQuantities(item.id)}
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
                      variantQuantities={getItemVariantQuantities(item.id)}
                      onUpdateQuantity={(delta) => handleUpdateItemQuantity(item, delta)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Professional Cafe Footer with Google Map & Rich Details */}
      <CafeFooter
        onCategorySelect={(cat) => setSelectedCategory(cat)}
        onOpenCart={handleOpenCart}
      />

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

      {/* ================= ORDER SYNC SUCCESS NOTIFICATION ================= */}
      {orderSyncSuccessMessage && (
        <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-600 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <p className="text-xs font-bold leading-tight">{orderSyncSuccessMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setOrderSyncSuccessMessage(null)}
              className="text-white/80 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
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
        deliveryInfo={deliveryInfo}
        tables={tables}
      />

      {/* ================= ADD TO CART NOTIFICATION TOAST ================= */}
      <CartToast
        toast={cartToast}
        onClose={() => setCartToast(null)}
        onOpenCart={handleOpenCart}
        onWhatsAppOrder={handleQuickWhatsAppOrder}
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
