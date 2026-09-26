import React from 'react';
import { Home, ShoppingCart, User } from 'lucide-react';
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
  onGoHome,
  onOpenCart,
  onOpenProfile,
  currentUser,
}) => {
  const userName = currentUser ? currentUser.fullName.split(' ')[0] : 'Profile';

  return (
    <>
      {/* Sticky Bottom Navigation Bar with Liquid Droplet Bubbles */}
      <nav
        id="cafe-bottom-navigation-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] py-2 px-3 sm:px-12 w-full max-w-full transition-colors duration-200"
        aria-label="Cafe Navigation"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-2">
          {/* HOME TAB BUBBLE DROPLET */}
          <button
            type="button"
            onClick={onGoHome}
            id="nav-tab-home"
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-[24px] cursor-pointer transition-all duration-300 animate-droplet-1 active:scale-95 select-none ${
              activeTab === 'home'
                ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-[0_6px_20px_rgba(225,29,72,0.4),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.2)] font-black scale-105'
                : 'bg-stone-100/90 dark:bg-stone-800/90 hover:bg-rose-50/90 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 border border-white/80 dark:border-stone-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.06)] font-bold'
            }`}
            title="Home Menu"
          >
            {/* Water Droplet Specular Surface Glare */}
            <span className="absolute top-1 left-3 w-4 h-1.5 bg-white/70 rounded-full blur-[0.3px] pointer-events-none" />
            <span className="absolute bottom-1 right-3 w-1.5 h-1 bg-white/30 rounded-full pointer-events-none" />

            <Home
              className={`w-4 h-4 transition-transform duration-300 ${
                activeTab === 'home' ? 'scale-110' : 'group-hover:scale-110'
              }`}
            />
            {/* Name INSIDE the water droplet bubble */}
            <span className="text-xs tracking-tight">Home</span>

            {/* Micro active water bead */}
            {activeTab === 'home' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs ml-0.5 animate-pulse" />
            )}
          </button>

          {/* CART SECTION TAB BUBBLE DROPLET */}
          <button
            type="button"
            onClick={onOpenCart}
            id="nav-tab-cart"
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-[24px] cursor-pointer transition-all duration-300 animate-droplet-2 active:scale-95 select-none ${
              activeTab === 'cart'
                ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-[0_6px_20px_rgba(225,29,72,0.4),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.2)] font-black scale-105'
                : 'bg-stone-100/90 dark:bg-stone-800/90 hover:bg-rose-50/90 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 border border-white/80 dark:border-stone-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.06)] font-bold'
            }`}
            title="Cart Drawer"
          >
            {/* Water Droplet Specular Surface Glare */}
            <span className="absolute top-1 left-3 w-4 h-1.5 bg-white/70 rounded-full blur-[0.3px] pointer-events-none" />
            <span className="absolute bottom-1 right-3 w-1.5 h-1 bg-white/30 rounded-full pointer-events-none" />

            <ShoppingCart
              className={`w-4 h-4 transition-transform duration-300 ${
                activeTab === 'cart' ? 'scale-110' : 'group-hover:scale-110'
              }`}
            />
            {/* Name INSIDE the water droplet bubble */}
            <span className="text-xs tracking-tight">Cart</span>

            {/* Cart Count Baby Droplet Pill */}
            {cartCount > 0 && (
              <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md border border-white dark:border-stone-900 animate-droplet-btn">
                {cartCount}
              </span>
            )}

            {/* Micro active water bead */}
            {activeTab === 'cart' && cartCount === 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs ml-0.5 animate-pulse" />
            )}
          </button>

          {/* PROFILE SECTION TAB BUBBLE DROPLET */}
          <button
            type="button"
            onClick={onOpenProfile}
            id="nav-tab-profile"
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-[24px] cursor-pointer transition-all duration-300 animate-droplet-3 active:scale-95 select-none ${
              activeTab === 'profile'
                ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-[0_6px_20px_rgba(225,29,72,0.4),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.2)] font-black scale-105'
                : 'bg-stone-100/90 dark:bg-stone-800/90 hover:bg-rose-50/90 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 border border-white/80 dark:border-stone-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.06)] font-bold'
            }`}
            title="Profile & Orders"
          >
            {/* Water Droplet Specular Surface Glare */}
            <span className="absolute top-1 left-3 w-4 h-1.5 bg-white/70 rounded-full blur-[0.3px] pointer-events-none" />
            <span className="absolute bottom-1 right-3 w-1.5 h-1 bg-white/30 rounded-full pointer-events-none" />

            {currentUser ? (
              <span className="w-4 h-4 rounded-full bg-white text-rose-600 font-black text-[10px] flex items-center justify-center shadow-xs">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User
                className={`w-4 h-4 transition-transform duration-300 ${
                  activeTab === 'profile' ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
            )}

            {/* Name INSIDE the water droplet bubble */}
            <span className="text-xs tracking-tight truncate max-w-[65px] sm:max-w-[90px]">
              {userName}
            </span>

            {/* Micro active water bead */}
            {activeTab === 'profile' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs ml-0.5 animate-pulse" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default CafeNavigationBar;
