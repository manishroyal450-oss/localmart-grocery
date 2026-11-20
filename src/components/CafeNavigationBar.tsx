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
    <nav
      id="cafe-bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] py-1.5 px-4 w-full max-w-full"
      aria-label="Cafe Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Home Tab */}
        <button
          type="button"
          onClick={onGoHome}
          id="nav-tab-home"
          className={`min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.97] select-none ${
            activeTab === 'home'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
          }`}
          title="Home Menu"
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Home</span>
        </button>

        {/* Cart Tab */}
        <button
          type="button"
          onClick={onOpenCart}
          id="nav-tab-cart"
          className={`min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.97] select-none ${
            activeTab === 'cart'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
          }`}
          title="Open Cart"
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Cart</span>
          {cartCount > 0 && (
            <span
              className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center ${
                activeTab === 'cart'
                  ? 'bg-white text-rose-600'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile Tab */}
        <button
          type="button"
          onClick={onOpenProfile}
          id="nav-tab-profile"
          className={`min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.97] select-none ${
            activeTab === 'profile'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
          }`}
          title="Profile & Account"
        >
          {currentUser ? (
            <span
              className={`w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-white text-rose-600'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {currentUser.fullName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate max-w-[72px] whitespace-nowrap">{userName}</span>
        </button>
      </div>
    </nav>
  );
};

export default CafeNavigationBar;
