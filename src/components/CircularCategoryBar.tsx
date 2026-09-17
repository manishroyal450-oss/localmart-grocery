import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryThumbnail } from '../services/menuService';

interface CircularCategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CircularCategoryBar: React.FC<CircularCategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const allCategories = ['All', ...categories];

  return (
    <div className="w-full bg-white border-b border-stone-100 py-3 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 relative flex items-center">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-700 hover:text-stone-900 transition-all cursor-pointer hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full px-2 py-1"
          role="tablist"
        >
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const thumbUrl = getCategoryThumbnail(cat);

            return (
              <button
                key={cat}
                id={`cat-circle-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectCategory(cat)}
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer transition-transform"
              >
                {/* Circular Image Container */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'ring-3 ring-rose-500 ring-offset-2 scale-105 shadow-md'
                      : 'ring-1 ring-stone-200 group-hover:ring-stone-300 group-hover:scale-102 shadow-xs'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={cat}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full bg-stone-100"
                  />
                </div>

                {/* Category Label */}
                <span
                  className={`mt-2 text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                    isSelected ? 'text-stone-950 font-bold' : 'text-stone-600 group-hover:text-stone-900'
                  }`}
                >
                  {cat}
                </span>

                {/* Active Indicator Underline */}
                <div
                  className={`h-0.5 rounded-full mt-1 transition-all duration-200 ${
                    isSelected ? 'w-8 bg-rose-500' : 'w-0 bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-700 hover:text-stone-900 transition-all cursor-pointer hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CircularCategoryBar;
