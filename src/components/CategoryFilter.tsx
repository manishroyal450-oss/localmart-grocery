import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryIcon } from '../services/menuService';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-amber-50/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs py-2.5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto relative flex items-center">
        {/* Left Scroll Button (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-3 z-10 w-7 h-7 rounded-full bg-white/90 shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full px-1"
          role="tablist"
          aria-label="Menu categories"
        >
          {/* "All" Option */}
          <button
            id="cat-pill-all"
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'All'}
            onClick={() => onSelectCategory('All')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-stone-900 text-amber-300 shadow-md scale-102 ring-2 ring-stone-900/20'
                : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/90 shadow-xs'
            }`}
          >
            <span>✨</span>
            <span>All Items</span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const icon = getCategoryIcon(cat);

            return (
              <button
                key={cat}
                id={`cat-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-md scale-102 ring-2 ring-amber-700/20'
                    : 'bg-white text-stone-700 hover:bg-amber-50 hover:text-stone-950 border border-stone-200/90 shadow-xs'
                }`}
              >
                <span className="text-sm">{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-3 z-10 w-7 h-7 rounded-full bg-white/90 shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default CategoryFilter;
