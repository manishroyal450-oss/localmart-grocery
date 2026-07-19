import React from 'react';
import Navbar from './components/Navbar';
import GroceryCatalog from './components/GroceryCatalog';
import AdminPanel from './components/AdminPanel';
import CartSidebar from './components/CartSidebar';
import LoginModal from './components/LoginModal';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomerAccountModal from './components/CustomerAccountModal';
import WhatsAppWidget from './components/WhatsAppWidget';
import ProductDetailView from './components/ProductDetailView';
import { Product, Order, CartItem, Customer, OrderItem } from './types';
import { ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';
import { ALL_PRODUCTS } from './data/allProducts';
import { motion } from 'motion/react';
import storefrontImg from './assets/images/bari_storefront_1784447298609.jpg';

export default function App() {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = React.useState<boolean>(false);

  // Customer Auth States
  const [currentCustomer, setCurrentCustomer] = React.useState<Customer | null>(() => {
    const saved = localStorage.getItem('localmart_grocery_customer');
    return saved ? JSON.parse(saved) : null;
  });
  const [showCustomerAuthModal, setShowCustomerAuthModal] = React.useState<boolean>(false);
  const [showCustomerAccountModal, setShowCustomerAccountModal] = React.useState<boolean>(false);
  const [customerAuthInitialMode, setCustomerAuthInitialMode] = React.useState<'login' | 'signup'>('signup');

  // Top and Bottom Popup states
  const [showTopBanner, setShowTopBanner] = React.useState<boolean>(true);
  const [showBottomPopup, setShowBottomPopup] = React.useState<boolean>(true);
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  
  // Data State managed purely locally
  const [products, setProducts] = React.useState<Product[]>(() => {
    const saved = localStorage.getItem('localmart_grocery_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing products from localstorage:', e);
      }
    }
    // Seed and return default products list
    localStorage.setItem('localmart_grocery_products', JSON.stringify(ALL_PRODUCTS));
    return ALL_PRODUCTS;
  });

  const [orders, setOrders] = React.useState<Order[]>(() => {
    const saved = localStorage.getItem('localmart_grocery_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing orders from localstorage:', e);
      }
    }
    return [];
  });

  // Since we are running fully local and offline-first, states are loaded instantly!
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Cart & Pincode Local Persistence
  const [cart, setCart] = React.useState<{ [productId: string]: number }>(() => {
    const saved = localStorage.getItem('localmart_grocery_cart');
    return saved ? JSON.parse(saved) : {};
  });

  const [pincode, setPincode] = React.useState<string>(() => {
    const saved = localStorage.getItem('localmart_grocery_pincode');
    return saved || '110001';
  });

  const [isCartOpen, setIsCartOpen] = React.useState<boolean>(false);

  // Sync cart and pincode to localStorage
  React.useEffect(() => {
    localStorage.setItem('localmart_grocery_cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    localStorage.setItem('localmart_grocery_pincode', pincode);
  }, [pincode]);

  // Dummy fetch handlers to keep components happy without breaking anything
  const fetchProducts = async (currentSearch: string = '', cat: string = 'All') => {
    // Declarative filtering is handled automatically!
  };

  const fetchOrders = async () => {
    // Orders are kept synchronized in the local React state!
  };

  // Clear selected product when search or category changes so we return to catalog
  React.useEffect(() => {
    setSelectedProductId(null);
  }, [searchQuery, selectedCategory]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const currentQty = prev[product.id] || 0;
      if (currentQty >= product.stock) {
        alert(`Cannot add more. Only ${product.stock} units are currently in stock!`);
        return prev;
      }
      return {
        ...prev,
        [product.id]: currentQty + 1,
      };
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prev) => {
      const currentQty = prev[product.id] || 0;
      if (currentQty <= 1) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }
      return {
        ...prev,
        [product.id]: currentQty - 1,
      };
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Convert cart state dict to structured CartItem list
  const cartItems: CartItem[] = React.useMemo(() => {
    return Object.keys(cart).map((productId) => {
      const product = products.find((p) => p.id === productId);
      return product ? { product, quantity: cart[productId] } : null;
    }).filter(Boolean) as CartItem[];
  }, [cart, products]);

  const cartCount = React.useMemo(() => {
    return Object.keys(cart).reduce((sum, key) => sum + (cart[key] || 0), 0);
  }, [cart]);

  // --- Client-Side State API handlers ---

  // --- Customer State Handlers ---
  const handleCustomerAuthSuccess = (customer: Customer) => {
    setCurrentCustomer(customer);
    localStorage.setItem('localmart_grocery_customer', JSON.stringify(customer));
    if (customer.pincode) {
      setPincode(customer.pincode);
    }
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('localmart_grocery_customer');
  };

  // 1. Checkout (Fully Localized)
  const handleCheckout = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryType: 'delivery' | 'pickup';
  }) => {
    const orderItems: OrderItem[] = cartItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      unit: item.product.unit,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const newOrder: Order = {
      id: 'order-' + Date.now(),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      deliveryType: orderData.deliveryType,
      status: 'Pending',
      items: orderItems,
      totalAmount: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      savings: cartItems.reduce((sum, item) => sum + (item.product.originalPrice - item.product.price) * item.quantity, 0),
      createdAt: new Date().toISOString(),
    };

    // Deduct stock levels of products locally
    const updatedProducts = products.map((prod) => {
      const cartItem = cartItems.find((item) => item.product.id === prod.id);
      if (cartItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity),
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    localStorage.setItem('localmart_grocery_products', JSON.stringify(updatedProducts));

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('localmart_grocery_orders', JSON.stringify(updatedOrders));

    return newOrder;
  };

  // 2. Add New Product (Fully Localized)
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };

    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);
    localStorage.setItem('localmart_grocery_products', JSON.stringify(updatedProducts));

    return newProduct;
  };

  // 3. Update Existing Product (Fully Localized)
  const handleUpdateProduct = async (productId: string, updatedFields: Partial<Product>) => {
    const updatedProducts = products.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p));
    setProducts(updatedProducts);
    localStorage.setItem('localmart_grocery_products', JSON.stringify(updatedProducts));

    return updatedProducts.find((p) => p.id === productId)!;
  };

  // 4. Update Product Image (Directly from Card / Catalog View)
  const handleUpdateProductImage = async (productId: string, base64Image: string) => {
    try {
      await handleUpdateProduct(productId, { image: base64Image });
    } catch (err: any) {
      alert('Photo update failed: ' + err.message);
    }
  };

  // 5. Delete Product (Fully Localized)
  const handleDeleteProduct = async (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('localmart_grocery_products', JSON.stringify(updatedProducts));

    // Remove from cart if it was deleted
    if (cart[productId]) {
      setCart((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  };

  // 6. Update Order Status (Fully Localized)
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updatedOrders);
    localStorage.setItem('localmart_grocery_orders', JSON.stringify(updatedOrders));

    return updatedOrders.find((o) => o.id === orderId)!;
  };

  // 7. Reset entire Database to Default pre-populated list (Fully Localized)
  const handleResetDatabase = async () => {
    localStorage.setItem('localmart_grocery_products', JSON.stringify(ALL_PRODUCTS));
    localStorage.setItem('localmart_grocery_orders', JSON.stringify([]));
    setProducts(ALL_PRODUCTS);
    setOrders([]);
    setCart({});
    return { products: ALL_PRODUCTS };
  };

  // Filtering products locally for search and categories
  const filteredDisplayProducts = React.useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description && p.description.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        return matchName || matchDesc || matchCategory;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 relative" id="localmart-app">
      
      {/* Low-Opacity Storefront Background Watermark across the entire website */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-repeat bg-center" 
        style={{ 
          backgroundImage: `url(${storefrontImg})`,
          backgroundSize: '380px',
        }}
      />
      <Navbar
        isAdmin={isAdmin}
        setIsAdmin={(val) => {
          if (val) {
            setShowLoginModal(true);
          } else {
            setIsAdmin(false);
          }
        }}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentPincode={pincode}
        setPincode={setPincode}
        currentCustomer={currentCustomer}
        onOpenAuth={() => {
          setCustomerAuthInitialMode('signup');
          setShowCustomerAuthModal(true);
        }}
        onLogout={handleCustomerLogout}
        onOpenAccount={() => setShowCustomerAccountModal(true)}
      />

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* Loading Spinner */}
        {isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20" id="main-loading-spinner">
            <RefreshCw className="h-10 w-10 text-emerald-700 animate-spin mb-4" />
            <p className="text-sm font-semibold text-gray-500">Connecting to Bari' All-In-One Mart local servers...</p>
          </div>
        )}

        {/* Database Error Banner */}
        {error && (
          <div className="max-w-xl mx-auto my-12 p-6 bg-rose-50 border border-rose-200 rounded-lg text-center" id="main-error-banner">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Connection Failed</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
            <button
              onClick={() => fetchProducts(searchQuery, selectedCategory)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Role view content */}
        {!error && hasLoadedOnce && (
          <>
            {isAdmin ? (
              <AdminPanel
                products={products}
                orders={orders}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onResetDatabase={handleResetDatabase}
                onExitAdmin={() => setIsAdmin(false)}
              />
            ) : selectedProductId && products.find((p) => p.id === selectedProductId) ? (
              <ProductDetailView
                product={products.find((p) => p.id === selectedProductId)!}
                allProducts={products}
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateProductImage={handleUpdateProductImage}
                onBack={() => setSelectedProductId(null)}
                onSelectProduct={(id) => setSelectedProductId(id)}
                pincode={pincode}
                isAdmin={isAdmin}
              />
            ) : (
              <GroceryCatalog
                products={filteredDisplayProducts}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateProductImage={handleUpdateProductImage}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onProductClick={(product) => setSelectedProductId(product.id)}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}

      </main>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-16 font-sans border-t border-gray-800" id="store-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-base tracking-tight italic">
              Bari' <span className="text-emerald-400 font-extrabold not-italic ml-1">All-In-One Mart</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your neighborhood local premium multi-department grocery outlet, powered by advanced client-side processing. Pick from fresh fruits, organic staples, milk, paneer, and sweets.
            </p>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest mb-3">Store Categories</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Fruits & Vegetables'); }} className="hover:text-white hover:underline transition text-left">Fruits & Vegetables</button></li>
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Dairy & Eggs'); }} className="hover:text-white hover:underline transition text-left">Dairy & Eggs</button></li>
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Pantry & Staples'); }} className="hover:text-white hover:underline transition text-left">Pantry & Staples</button></li>
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Electronics'); }} className="hover:text-white hover:underline transition text-left">Electronics & Chargers</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest mb-3">Customer Service & Location</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Store Location: <strong className="text-white font-medium block mt-0.5">Bari' All-In-One Mart - Premium natural, organic & daily needs local grocery.</strong></li>
              <li className="flex flex-col gap-0.5">
                <span>Call Support:</span>
                <a href="tel:+917500236520" className="text-yellow-400 font-extrabold hover:underline text-sm font-mono">+91 75002 36520</a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span>WhatsApp Support:</span>
                <a href="https://wa.me/917500236520" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-extrabold hover:underline text-sm font-mono">+91 75002 36520</a>
              </li>
              <li>Pincode Checker: <strong className="text-yellow-400 font-mono">{pincode}</strong></li>
              <li>Secure SSL Checkouts</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest mb-3">Capacity info</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              Supports scalable local inventory management up to approximately <strong>2000 active items</strong> with instant base64 custom photo uploads.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] bg-gray-800 text-yellow-400 font-bold px-2.5 py-1 rounded border border-gray-700 font-mono">
              💾 LOCAL SECURE DATABASE ACTIVE
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Bari' All-In-One Mart Local Grocery Partner. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Use</span>
            <span 
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                } else {
                  setShowLoginModal(true);
                }
              }} 
              className="hover:text-gray-400 cursor-pointer text-yellow-400 font-bold"
            >
              Admin Login
            </span>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar drawer */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        currentCustomer={currentCustomer}
      />

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setIsAdmin(true)}
      />

      {/* Customer Registration and Authentication Modal */}
      <CustomerAuthModal
        isOpen={showCustomerAuthModal}
        onClose={() => setShowCustomerAuthModal(false)}
        onAuthSuccess={handleCustomerAuthSuccess}
        initialMode={customerAuthInitialMode}
      />

      {/* Customer Profile & Transaction Dashboard */}
      <CustomerAccountModal
        isOpen={showCustomerAccountModal}
        onClose={() => setShowCustomerAccountModal(false)}
        currentCustomer={currentCustomer}
        onUpdateProfile={handleCustomerAuthSuccess}
      />

      {/* Interactive WhatsApp Help desk Corner Widget */}
      <WhatsAppWidget currentCustomer={currentCustomer} />

      {/* Bottom Promotion/Name Announcement Popup */}
      {showBottomPopup && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.8 }}
          className="fixed bottom-24 right-6 md:right-8 z-40 max-w-sm bg-white rounded-xl shadow-2xl p-5 border border-emerald-100 flex flex-col gap-3 font-sans text-gray-800"
          id="bottom-announcement-popup"
        >
          {/* Downward pointing arrow directly above the WhatsApp button */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-red-500 border-r border-b border-red-500 rotate-45" />

          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg animate-pulse">
                🏪
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 leading-tight">
                  Bari' All-In-One Mart
                </h4>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                  Now Live in Your Pincode
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowBottomPopup(false);
              }}
              className="text-gray-400 hover:text-gray-600 font-extrabold text-lg -mt-1 focus:outline-none"
              title="Dismiss promotion"
            >
              &times;
            </button>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed relative z-10">
            Welcome to the newly launched <strong className="text-emerald-800 font-bold">Bari' All-In-One Mart</strong>! We supply direct-from-farm fresh fruits, organic daily staples, dairy, milk, paneer, and sweets. Enjoy flat ₹50 discount on your first checkout.
          </p>

          <div className="flex items-center justify-between gap-3 border-t pt-3 mt-1 relative z-10">
            <div className="text-[11px] text-gray-500">
              Delivery to <strong className="font-mono text-emerald-700 font-extrabold">{pincode}</strong>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setShowBottomPopup(false);
                }}
                className="px-2.5 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-100 rounded transition"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  if (!currentCustomer) {
                    setCustomerAuthInitialMode('signup');
                    setShowCustomerAuthModal(true);
                  } else {
                    setIsCartOpen(true);
                  }
                }}
                className="px-3 py-1.5 text-[11px] font-extrabold text-white bg-emerald-850 hover:bg-emerald-950 rounded transition shadow"
              >
                {!currentCustomer ? 'Register & Save' : 'Shop Now'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
