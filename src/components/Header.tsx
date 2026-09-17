import React from 'react';
import { Coffee, Sparkles } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastSyncedTime?: string;
  totalItems: number;
  totalCategories: number;
  fromCache?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  lastSyncedTime,
  totalItems,
  totalCategories,
  fromCache,
}) => {
  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-md flex-shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                  Friends 4 Ever Coffee Cafe
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Digital Menu
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 font-medium mt-0.5">
                Freshly brewed coffee, shakes, pizza, burgers, fast food & bites
              </p>
            </div>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs border border-emerald-500 flex items-center justify-center p-0.5 bg-stone-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <strong className="text-stone-300 font-semibold">100% Pure Veg Cafe</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
