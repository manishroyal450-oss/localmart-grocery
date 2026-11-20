import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryThumbnail, sortCustomCategories } from '../services/menuService';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Drag physics state
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sortedCategories = useMemo(() => {
    return sortCustomCategories(categories);
  }, [categories]);

  const allCategories = useMemo(() => {
    return ['All', ...sortedCategories];
  }, [sortedCategories]);

  // Update scroll arrows & subtle depth emphasis
  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(container.scrollLeft < maxScroll - 10);
  }, []);

  const requestScrollUpdate = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    requestScrollUpdate();

    const handleScroll = () => requestScrollUpdate();
    const handleResize = () => requestScrollUpdate();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [requestScrollUpdate, allCategories.length]);

  // Scroll selected item cleanly into view (starting from left edge at index 0)
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const itemOffsetLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScroll =
      index === 0 ? 0 : itemOffsetLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: Math.max(0, Math.min(maxScroll, targetScroll)),
      behavior,
    });
  }, []);

  useEffect(() => {
    const activeIndex = allCategories.indexOf(selectedCategory);
    if (activeIndex !== -1) {
      const timer = setTimeout(() => {
        scrollToItem(activeIndex, 'smooth');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, allCategories, scrollToItem]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    scrollStartRef.current = container.scrollLeft;
    velocityRef.current = 0;
    hasDraggedRef.current = false;
    container.style.scrollBehavior = 'auto';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }

    velocityRef.current = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;

    container.scrollLeft = scrollStartRef.current - deltaX;
    requestScrollUpdate();
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    const container = containerRef.current;
    if (!container) return;

    container.style.scrollBehavior = 'smooth';

    if (Math.abs(velocityRef.current) > 3) {
      container.scrollBy({
        left: -velocityRef.current * 16,
        behavior: 'smooth',
      });
    }

    requestScrollUpdate();
  };

  const handleScrollByStep = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const step = direction === 'left' ? -240 : 240;
    container.scrollBy({ left: step, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-full bg-white border-b border-stone-200/80 py-3 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center w-full min-w-0">
        {/* Left Horizon Fade (only when scrolled past start) */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-14 bg-gradient-to-r from-white via-white/85 to-transparent z-20 pointer-events-none" />
        )}

        {/* Right Horizon Fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-14 bg-gradient-to-l from-white via-white/85 to-transparent z-20 pointer-events-none" />
        )}

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScrollByStep('left')}
          disabled={!canScrollLeft}
          className={`hidden md:flex absolute left-2 z-30 w-8 h-8 rounded-full bg-white shadow-sm border border-stone-200 items-center justify-center text-stone-700 transition-all cursor-pointer hover:border-rose-300 hover:text-rose-600 active:scale-95 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Left-Aligned Scrollable Category Strip */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-start gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar w-full min-w-0 py-1.5 cursor-grab active:cursor-grabbing touch-pan-x"
          style={{
            paddingLeft: '8px',
            paddingRight: '16px',
          }}
          role="tablist"
          aria-label="Menu categories"
        >
          {allCategories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            const thumbUrl = getCategoryThumbnail(cat);

            return (
              <button
                key={cat}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                id={`cat-circle-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={(e) => {
                  if (hasDraggedRef.current) {
                    e.preventDefault();
                    return;
                  }
                  onSelectCategory(cat);
                  scrollToItem(idx, 'smooth');
                }}
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer transition-transform duration-150 active:scale-95 py-0.5"
              >
                {/* Circular Dish Avatar */}
                <div
                  className={`relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-rose-600 ring-offset-2 bg-white shadow-sm'
                      : 'ring-1 ring-stone-200 group-hover:ring-stone-400 bg-stone-50'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={cat}
                    loading="lazy"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full bg-stone-100 pointer-events-none select-none"
                  />
                </div>

                {/* Category Label */}
                <span
                  className={`mt-2 text-xs sm:text-[13px] tracking-tight transition-colors duration-150 select-none whitespace-nowrap ${
                    isSelected
                      ? 'text-rose-600 font-bold'
                      : 'text-stone-600 group-hover:text-stone-900 font-medium'
                  }`}
                >
                  {cat}
                </span>

                {/* Active Indicator Bar */}
                <div
                  className={`h-0.5 rounded-full mt-1 transition-all duration-200 ${
                    isSelected ? 'w-7 bg-rose-600' : 'w-0 bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScrollByStep('right')}
          disabled={!canScrollRight}
          className={`hidden md:flex absolute right-2 z-30 w-8 h-8 rounded-full bg-white shadow-sm border border-stone-200 items-center justify-center text-stone-700 transition-all cursor-pointer hover:border-rose-300 hover:text-rose-600 active:scale-95 ${
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CircularCategoryBar;
