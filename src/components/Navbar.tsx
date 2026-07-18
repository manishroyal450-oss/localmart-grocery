import React from 'react';
import { Search, ShoppingCart, Store, User, MapPin } from 'lucide-react';
import { CategoryType, Customer } from '../types';

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
    <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-md font-sans" id="main-header">
      {/* Primary Top Bar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo - Whole Foods Market Style */}
          <div className="flex flex-col cursor-pointer" onClick={() => setIsAdmin(false)} id="brand-logo">
            <span className="text-lg md:text-xl font-black italic tracking-tight flex items-center">
              Whole Foods
              <span className="text-yellow-400 font-extrabold not-italic ml-1">Market</span>
            </span>
            <span className="text-[10px] text-yellow-300 italic -mt-1 font-semibold flex items-center gap-0.5">
              Organic & Fresh Grocery
            </span>
          </div>

          {/* Delivery Pin Selector (Flipkart-style local indicator) */}
          <div 
            onClick={() => setShowPinModal(true)}
            className="hidden sm:flex items-center gap-1 cursor-pointer hover:bg-blue-600/50 p-1.5 rounded transition"
            id="pincode-trigger"
          >
            <MapPin className="h-4 w-4 text-yellow-400" />
            <div className="text-xs">
              <p className="text-gray-200 text-[10px] leading-3">Deliver to</p>
              <p className="font-semibold leading-4">{currentPincode}</p>
            </div>
          </div>

          {/* Actions / Nav Buttons */}
          <div className="flex items-center gap-2 md:gap-6 ml-auto" id="nav-actions">
            
            {/* Admin Toggle */}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-sm transition-all duration-200 ${
                isAdmin 
                  ? 'bg-yellow-400 text-gray-900 border border-yellow-500' 
                  : 'bg-white text-[#2874f0] border border-transparent hover:bg-gray-100'
              }`}
              id="admin-toggle-btn"
            >
              <Store className="h-4 w-4" />
              <span className="hidden md:inline">{isAdmin ? 'Customer View' : 'Store Admin'}</span>
              <span className="md:hidden">{isAdmin ? 'User' : 'Admin'}</span>
            </button>

            {/* Shopping Cart Button */}
            {!isAdmin && (
              <button
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600/50 rounded text-white font-semibold relative transition"
                id="cart-trigger-btn"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[11px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center animate-pulse"
                      id="cart-badge-count"
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-sm">Cart</span>
              </button>
            )}

            {/* Profile Account Dropdown */}
            <div className="relative group flex items-center">
              {currentCustomer ? (
                <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-blue-600/50 relative" id="navbar-customer-profile">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold uppercase text-xs shadow-sm">
                    {currentCustomer.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-xs text-left">
                    <p className="text-[9px] text-gray-200 leading-none">Welcome,</p>
                    <p className="font-extrabold text-white leading-normal truncate max-w-[100px]">{currentCustomer.fullName.split(' ')[0]}</p>
                  </div>

                  {/* Dropdown Menu on Hover */}
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-800 rounded-lg shadow-2xl py-2 border border-gray-100 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100 text-xs">
                      <p className="font-extrabold text-gray-900 truncate">{currentCustomer.fullName}</p>
                      <p className="text-gray-500 truncate text-[10px]">{currentCustomer.email}</p>
                      <p className="text-[#2874f0] font-bold mt-1 font-mono text-[10px]">{currentCustomer.phone}</p>
                    </div>
                    <div className="px-4 py-2 text-[11px] text-gray-600 border-b border-gray-100 leading-relaxed bg-gray-50">
                      <span className="font-extrabold text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">Shipping Address</span>
                      {currentCustomer.shippingAddress}, {currentCustomer.city} - <strong className="font-mono text-[#2874f0]">{currentCustomer.pincode}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenAccount}
                      className="w-full text-left px-4 py-2 text-xs font-extrabold text-[#2874f0] hover:bg-blue-50 transition border-b border-gray-100"
                      id="navbar-account-btn"
                    >
                      My Account & Orders
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      id="navbar-logout-btn"
                    >
                      Sign Out Account
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-blue-600/50 text-white font-semibold transition"
                  id="navbar-signin-trigger"
                >
                  <User className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline text-sm whitespace-nowrap">Sign In</span>
                  <span className="sm:hidden text-xs">Sign In</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Pincode Selector Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" id="pincode-modal">
          <div className="w-full max-w-sm bg-white rounded-lg p-6 shadow-2xl text-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#2874f0]">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-center text-lg tracking-wider"
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
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#2874f0] hover:bg-[#1a5cb8] rounded shadow"
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
