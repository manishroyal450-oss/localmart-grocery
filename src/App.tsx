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
import { Product, Order, CartItem, Customer } from './types';
import { ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';

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

  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  
  // Data State
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState<boolean>(false);
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

  // Fetch products and orders
  const fetchProducts = async (currentSearch: string = '', cat: string = 'All') => {
    setIsLoading(true);
    setError(null);
    try {
      const adminParam = isAdmin ? 'true' : 'false';
      let url = `/api/products?admin=${adminParam}`;
      
      if (cat !== 'All') {
        url += `&category=${encodeURIComponent(cat)}`;
      }
      if (currentSearch.trim() !== '') {
        url += `&search=${encodeURIComponent(currentSearch)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to retrieve catalog list.');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connecting to store catalog failed.');
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to load customer orders log.');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Fetch catalog on search, category or role changes
  React.useEffect(() => {
    fetchProducts(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, isAdmin]);

  // Clear selected product when search or category changes so we return to catalog
  React.useEffect(() => {
    setSelectedProductId(null);
  }, [searchQuery, selectedCategory]);

  // Fetch orders periodically when Admin Mode is open
  React.useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 8000); // Poll orders every 8 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

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

  // --- API handlers ---

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

  // 1. Checkout
  const handleCheckout = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryType: 'delivery' | 'pickup';
  }) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        items: cartItems,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to place order.');
    }

    const orderResult = await response.json();
    // Refresh products to show updated stock
    fetchProducts(searchQuery, selectedCategory);
    if (isAdmin) {
      fetchOrders();
    }
    return orderResult;
  };

  // 2. Add New Product
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to save product.');
    }

    const added = await res.json();
    setProducts((prev) => [added, ...prev]);
    return added;
  };

  // 3. Update Existing Product
  const handleUpdateProduct = async (productId: string, updatedFields: Partial<Product>) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to update product.');
    }

    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    return updated;
  };

  // 4. Update Product Image (Directly from Card / Catalog View)
  const handleUpdateProductImage = async (productId: string, base64Image: string) => {
    try {
      await handleUpdateProduct(productId, { image: base64Image });
    } catch (err: any) {
      alert('Photo update failed: ' + err.message);
    }
  };

  // 5. Delete Product
  const handleDeleteProduct = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to delete product.');
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    // Remove from cart if it was deleted
    if (cart[productId]) {
      setCart((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  };

  // 6. Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to update status.');
    }

    const updated = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    return updated;
  };

  // 7. Reset entire Database to Default pre-populated list
  const handleResetDatabase = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Resetting failed.');
    
    const result = await res.json();
    setProducts(result.products);
    setOrders([]);
    setCart({});
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800" id="localmart-app">
      
      {/* Navigation Topbar */}
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
            <RefreshCw className="h-10 w-10 text-[#2874f0] animate-spin mb-4" />
            <p className="text-sm font-semibold text-gray-500">Connecting to Flipkart Grocery local servers...</p>
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
              className="px-4 py-2 bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-semibold rounded shadow transition"
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
                products={products}
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
              Flipkart<span className="text-yellow-400 font-extrabold not-italic">Grocery</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your neighborhood local grocery outlet, powered by advanced cloud ordering. Pick from fresh fruits, staples, milk, paneer, and sweets.
            </p>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest mb-3">Store Categories</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Fruits & Vegetables'); }} className="hover:text-white hover:underline transition text-left">Fruits & Vegetables</button></li>
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Dairy & Eggs'); }} className="hover:text-white hover:underline transition text-left">Dairy & Eggs</button></li>
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Pantry & Staples'); }} className="hover:text-white hover:underline transition text-left">Pantry & Staples</button></li>
              <li><button onClick={() => { setIsAdmin(false); setSelectedCategory('Beverages'); }} className="hover:text-white hover:underline transition text-left">Beverages & Coffee</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest mb-3">Customer Service & Location</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Store Location: <strong className="text-white font-medium block mt-0.5">Whole Foods Market - Premium natural & organic local grocery.</strong></li>
              <li className="flex flex-col gap-0.5">
                <span>Call Support:</span>
                <a href="tel:9258170946" className="text-yellow-400 font-extrabold hover:underline text-sm font-mono">9258170946</a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span>WhatsApp Support:</span>
                <a href="https://wa.me/919027304872" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-extrabold hover:underline text-sm font-mono">9027304872</a>
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
              ⚡ LIVE DATABASES ACTIVE
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Flipkart Local Grocery Store Partner. All rights reserved.</p>
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

    </div>
  );
}
