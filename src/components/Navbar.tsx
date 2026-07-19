import React from 'react';
import { Search, ShoppingCart, Store, User, MapPin, Menu } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-emerald-800 text-white shadow-md font-sans" id="main-header">
      {/* Primary Top Bar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo - Bari' All-In-One Mart Style */}
          <div className="flex flex-col cursor-pointer" onClick={() => setIsAdmin(false)} id="brand-logo">
            <span className="text-lg md:text-xl font-black italic tracking-tight flex items-center">
              Bari'
              <span className="text-yellow-400 font-extrabold not-italic ml-1">All-In-One Mart</span>
            </span>
            <span className="text-[10px] text-yellow-300 italic -mt-0.5 font-semibold flex items-center gap-0.5">
              Organic & Fresh Grocery • Daily Essentials
            </span>
          </div>

          {/* Delivery Pin Selector (Local indicator) */}
          <div 
            onClick={() => setShowPinModal(true)}
            className="hidden sm:flex items-center gap-1 cursor-pointer hover:bg-emerald-700/50 p-1.5 rounded transition"
            id="pincode-trigger"
          >
            <MapPin className="h-4 w-4 text-yellow-400" />
            <div className="text-xs">
              <p className="text-gray-200 text-[10px] leading-3">Deliver to</p>
              <p className="font-semibold leading-4">{currentPincode}</p>
            </div>
          </div>

          {/* Actions / Nav Buttons consolidated into the modern Shifting Side Menu */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto" id="nav-actions">
            
            {/* Unified Store Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-extrabold text-xs md:text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-200 relative group border border-yellow-500 cursor-pointer"
              id="shifting-menu-trigger-btn"
            >
              <Menu className="h-4 w-4 md:h-4.5 md:w-4.5 text-gray-900 group-hover:rotate-12 transition-transform duration-200" />
              <span>Store Menu</span>
              
              {/* Simple Cart Count Notification Badge on the Menu Trigger */}
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] px-1.5 rounded-full bg-rose-600 text-[9px] font-black text-white items-center justify-center shadow animate-pulse border border-white">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

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
