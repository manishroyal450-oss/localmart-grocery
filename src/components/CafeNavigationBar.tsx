import React from 'react';
import { Home, ShoppingCart, User, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../services/authService';

interface CafeNavigationBarProps {
  activeTab: 'home' | 'cart' | 'profile';
  cartCount: number;
  cartTotalAmount: number;
  onGoHome: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  currentUser?: UserProfile | null;
}

export const CafeNavigationBar: React.FC<CafeNavigationBarProps> = ({
  activeTab,
  cartCount,
  cartTotalAmount,
  onGoHome,
  onOpenCart,
  onOpenProfile,
  currentUser,
}) => {
  return (
    <>
      {/* 1. Floating Cart Quick-Bar (Appears above bottom navigation whenever items are in cart) */}
      {cartCount > 0 && activeTab !== 'cart' && (
        <div className="fixed bottom-16 sm:bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div
            onClick={onOpenCart}
            className="bg-stone-900/95 hover:bg-stone-900 text-white backdrop-blur-md px-4 py-2.5 sm:py-3 rounded-2xl shadow-xl border border-stone-800 flex items-center justify-between cursor-pointer group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white relative shadow-xs">
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-white block">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in Cart
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  ₹{cartTotalAmount} total
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-black text-rose-400 group-hover:text-rose-300">
              <span>View Cart 🛒</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Sticky Bottom Navigation Bar (Home, Cart, Profile) */}
      <nav
        id="cafe-bottom-navigation-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-2xl py-1 px-4 sm:px-12 w-full max-w-full"
        aria-label="Cafe Navigation"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* HOME TAB */}
          <button
            type="button"
            onClick={onGoHome}
            className={`flex flex-col items-center justify-center py-1.5 px-5 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              activeTab === 'home'
                ? 'text-rose-600 font-black'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'home'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs scale-105'
                  : 'group-hover:bg-stone-100'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
            {activeTab === 'home' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5" />
            )}
          </button>

          {/* CART SECTION TAB */}
          <button
            type="button"
            onClick={onOpenCart}
            id="nav-tab-cart"
            className={`flex flex-col items-center justify-center py-1.5 px-5 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              activeTab === 'cart'
                ? 'text-rose-600 font-black'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center relative transition-all ${
                activeTab === 'cart'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs scale-105'
                  : 'group-hover:bg-stone-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce [animation-duration:2s]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight flex items-center gap-0.5">
              <span>Cart</span>
              {cartCount > 0 && <span className="text-[10px] font-bold">({cartCount})</span>}
            </span>
            {activeTab === 'cart' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5" />
            )}
          </button>

          {/* PROFILE SECTION TAB */}
          <button
            type="button"
            onClick={onOpenProfile}
            id="nav-tab-profile"
            className={`flex flex-col items-center justify-center py-1.5 px-5 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              activeTab === 'profile'
                ? 'text-rose-600 font-black'
                : 'text-stone-500 hover:text-stone-900 font-medium'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'profile'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs scale-105'
                  : 'group-hover:bg-stone-100'
              }`}
            >
              {currentUser ? (
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-[70px]">
              {currentUser ? currentUser.fullName.split(' ')[0] : 'Profile'}
            </span>
            {activeTab === 'profile' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default CafeNavigationBar;
