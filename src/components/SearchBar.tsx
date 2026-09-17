import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
  totalCount: number;
  selectedCategory: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
  selectedCategory,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700/70" />
        </div>

        <input
          id="menu-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${selectedCategory === 'All' ? 'menu items' : selectedCategory}... (e.g. Mojito, Pizza, Momos, Coffee)`}
          className="w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm sm:text-base font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all"
        />

        {searchQuery && (
          <button
            id="btn-clear-search"
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            title="Clear search"
          >
            <div className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </div>
          </button>
        )}
      </div>

      {/* Result stats - only shown when actively searching */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-stone-500 mt-2 px-1">
          <span>
            Found <strong className="text-amber-900 font-bold">{filteredCount}</strong> result{filteredCount === 1 ? '' : 's'} for "{searchQuery}"
          </span>

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
              Filter: {selectedCategory}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchBar;
