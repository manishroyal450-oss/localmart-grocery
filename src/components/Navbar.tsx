import React from 'react';
import { Search, ShoppingCart, Store, User, MapPin, Menu, Utensils, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { CategoryType, Customer } from '../types';
import ShiftingMenu from './ShiftingMenu';

interface NavbarProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentPincode: string;
  setPincode: (pin: string) => void;
  currentCustomer: Customer | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAccount: () => void;
  currentView: 'grocery' | 'restaurant' | 'privacy';
  setCurrentView: (view: 'grocery' | 'restaurant' | 'privacy') => void;
  onOpenPrivacyPolicy?: () => void;
}

export default function Navbar({
  isAdmin,
  setIsAdmin,
  cartCount,
  onOpenCart,
  currentPincode,
  setPincode,
  currentCustomer,
  onOpenAuth,
  onLogout,
  onOpenAccount,
  currentView,
  setCurrentView,
  onOpenPrivacyPolicy,
}: NavbarProps) {
  const [pinInput, setPinInput] = React.useState(currentPincode);
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() && pinInput.trim().length === 6) {
      setPincode(pinInput.trim());
      setShowPinModal(false);
    } else {
      alert('Please enter a valid 6-digit pincode');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-emerald-850 text-white shadow-md font-sans border-b border-emerald-900" id="main-header">
      {/* Primary Top Bar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-3 md:gap-6">
          
          {/* Brand Logo - Manish Royal Web Designer */}
          <div 
            className="flex flex-col cursor-pointer flex-shrink-0 group" 
            onClick={() => {
              setIsAdmin(false);
              setCurrentView('grocery');
            }} 
            id="brand-logo"
          >
            <span className="text-lg md:text-xl font-black tracking-tight flex items-center gap-1.5">
              <span className="text-white group-hover:text-yellow-300 transition-colors duration-300">Manish Royal</span>
              <span className="animate-shimmer-text font-extrabold text-sm md:text-base px-2 py-0.5 rounded-full bg-emerald-950/80 border border-yellow-400/40 shadow-sm flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                Web Designer
              </span>
            </span>
            <span className="text-[10px] text-yellow-300 italic -mt-0.5 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Animated UI • Organic Grocery & Cafe Hub
            </span>
          </div>

          {/* Navigation View Switcher Tabs (Grocery vs Restaurant) */}
          {!isAdmin && (
            <div className="hidden sm:flex items-center bg-emerald-950/80 p-1 rounded-xl border border-emerald-700/60 text-xs font-bold shadow-inner">
              <button
                onClick={() => setCurrentView('grocery')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentView === 'grocery'
                    ? 'bg-yellow-400 text-gray-950 font-black shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                }`}
                id="nav-tab-grocery"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Grocery Store</span>
              </button>

              <button
                onClick={() => setCurrentView('restaurant')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer relative ${
                  currentView === 'restaurant'
                    ? 'bg-amber-500 text-gray-950 font-black shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                }`}
                id="nav-tab-restaurant"
              >
                <Utensils className="h-3.5 w-3.5 text-amber-900" />
                <span>Restaurant Menu</span>
                <span className="ml-1 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full animate-pulse">
                  NEW
                </span>
              </button>
            </div>
          )}

          {/* Delivery Pin Selector (Local indicator) */}
          <div 
            onClick={() => setShowPinModal(true)}
            className="hidden lg:flex items-center gap-1 cursor-pointer hover:bg-emerald-700/50 p-1.5 rounded transition"
            id="pincode-trigger"
          >
            <MapPin className="h-4 w-4 text-yellow-400" />
            <div className="text-xs">
              <p className="text-gray-200 text-[10px] leading-3">Deliver to</p>
              <p className="font-semibold leading-4">{currentPincode}</p>
            </div>
          </div>

          {/* Actions / Nav Buttons consolidated into the modern Shifting Side Menu */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto" id="nav-actions">
            
            {/* Quick Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900/90 hover:bg-emerald-900 border border-emerald-700/80 text-white rounded-lg font-bold text-xs shadow-xs transition"
              id="navbar-cart-quick-btn"
            >
              <ShoppingCart className="h-4 w-4 text-yellow-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-yellow-400 text-gray-950 text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Unified Store Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-extrabold text-xs md:text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-200 relative group border border-yellow-500 cursor-pointer"
              id="shifting-menu-trigger-btn"
            >
              <Menu className="h-4 w-4 text-gray-900 group-hover:rotate-12 transition-transform duration-200" />
              <span>Store Menu</span>
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Nav Switcher Strip */}
      {!isAdmin && (
        <div className="sm:hidden flex bg-emerald-950 border-t border-emerald-800 text-xs font-bold">
          <button
            onClick={() => setCurrentView('grocery')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition ${
              currentView === 'grocery'
                ? 'bg-yellow-400 text-gray-950 font-black'
                : 'text-gray-300 hover:bg-emerald-900'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Grocery Store</span>
          </button>
          <button
            onClick={() => setCurrentView('restaurant')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition relative ${
              currentView === 'restaurant'
                ? 'bg-amber-500 text-gray-950 font-black'
                : 'text-gray-300 hover:bg-emerald-900'
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>Restaurant Menu</span>
            <span className="bg-red-600 text-white text-[7px] font-black uppercase px-1 rounded-full">
              HOT
            </span>
          </button>
          <button
            onClick={() => setCurrentView('privacy')}
            className={`px-3 py-2 flex items-center justify-center gap-1 transition ${
              currentView === 'privacy'
                ? 'bg-emerald-700 text-white font-black'
                : 'text-emerald-300 hover:bg-emerald-900'
            }`}
            id="mobile-nav-privacy-btn"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-yellow-400" />
            <span>Privacy</span>
          </button>
        </div>
      )}

      {/* Consolidated Shifting Side Menu Drawer */}
      <ShiftingMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        currentCustomer={currentCustomer}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onOpenAccount={onOpenAccount}
        currentPincode={currentPincode}
        onOpenPincodeModal={() => setShowPinModal(true)}
        currentView={currentView === 'privacy' ? 'grocery' : currentView}
        setCurrentView={(v) => setCurrentView(v)}
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
      />

      {/* Pincode Selector Modal */}

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" id="pincode-modal">
          <div className="w-full max-w-sm bg-white rounded-lg p-6 shadow-2xl text-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800">
                <MapPin className="h-5 w-5" />
                Select Delivery Pincode
              </h3>
              <button 
                onClick={() => setShowPinModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handlePincodeSubmit}>
              <p className="text-xs text-gray-500 mb-4">
                Enter your 6-digit delivery pincode to check local item availability and shipping slots.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Enter Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 110001"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono text-center text-lg tracking-wider"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  id="pincode-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-950 rounded shadow"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
