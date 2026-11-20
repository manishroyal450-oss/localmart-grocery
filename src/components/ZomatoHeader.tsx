import React from 'react';
import { MapPin, Search, X, ArrowUpRight, User, LayoutDashboard } from 'lucide-react';
import { UserProfile } from '../services/authService';

interface ZomatoHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenAdmin?: () => void;
  onGoHome?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  activeTab?: 'home' | 'cart' | 'profile';
  vegOnly?: boolean;
  onToggleVegOnly?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CAFE_FULL_ADDRESS =
  'Chandpur - Dattiyana Rd, Chandpur, Saraishekh Habib, Uttar Pradesh 246725';
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `Friends 4 Ever Coffee Cafe, ${CAFE_FULL_ADDRESS}`
)}`;

export const ZomatoHeader: React.FC<ZomatoHeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenProfile,
  onOpenAdmin,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-3 space-y-2.5">
        {/* Top Bar Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Brand & Location Link */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onGoHome}
              className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center flex-shrink-0 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Friends 4 Ever Coffee Cafe"
              aria-label="Go to menu home"
            >
              <MapPin className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <button
                  type="button"
                  onClick={onGoHome}
                  className="text-base sm:text-xl font-bold font-display text-stone-900 tracking-tight truncate hover:text-rose-600 transition-colors cursor-pointer text-left"
                >
                  Friends 4 Ever Coffee Cafe
                </button>
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open in Google Maps: ${CAFE_FULL_ADDRESS}`}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 hover:text-rose-600 transition-colors font-medium truncate max-w-full"
              >
                <span className="truncate">Chandpur - Dattiyana Rd</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-600 font-semibold inline-flex items-center gap-0.5 shrink-0">
                  Directions
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </a>
            </div>
          </div>

          {/* Primary Admin & Account / Profile Triggers */}
          <div className="flex items-center gap-2 flex-shrink-0" id="header-corner-actions">
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                id="header-admin-btn"
                className="min-h-[40px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98]"
                title="Open Cafe Admin Panel"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenProfile}
              id="header-profile-btn"
              className="min-h-[40px] flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-rose-50/70 border border-stone-200 hover:border-rose-300 transition-all duration-150 cursor-pointer group active:scale-[0.98]"
              title={
                currentUser
                  ? `Logged in as ${currentUser.fullName} (View Profile)`
                  : 'Create Profile / Log In'
              }
            >
              {currentUser ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="text-xs font-semibold text-stone-900 group-hover:text-rose-600 block truncate max-w-[100px]">
                      {currentUser.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Profile
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-white text-stone-700 group-hover:text-rose-600 border border-stone-200 flex items-center justify-center shrink-0 transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800 group-hover:text-rose-600 whitespace-nowrap">
                    Sign In
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>

          <input
            id="zomato-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search "pizza", "cold coffee", "burger", "shakes"...'
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200/90 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-150"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 min-w-[32px] min-h-[32px] rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 flex items-center justify-center transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ZomatoHeader;
