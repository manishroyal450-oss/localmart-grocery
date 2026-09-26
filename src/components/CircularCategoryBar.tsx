import React, { useRef, useEffect, useCallback, useState } from 'react';
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

  const allCategories = ['All', ...categories];

  // Core 3D Cylinder transformation calculation for each item
  const updateCylinderTransforms = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const halfWidth = containerRect.width / 2 || 1;

    // Check scroll boundary state for arrows
    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(container.scrollLeft < maxScroll - 10);

    itemRefs.current.forEach((el, index) => {
      if (!el) return;

      const itemRect = el.getBoundingClientRect();
      const itemCenterX = itemRect.left + itemRect.width / 2;
      
      // Normalized distance from center (-1 to 1 for visible items)
      const distFromCenter = (itemCenterX - containerCenterX) / halfWidth;
      const clampedDist = Math.max(-1.4, Math.min(1.4, distFromCenter));
      const absDist = Math.abs(clampedDist);

      // 3D Cylinder geometry calculations:
      // Items curve away into the 3D distance and swivel toward the camera
      const rotateY = -clampedDist * 34; // degrees inward curved along cylinder face
      const translateZ = -Math.min(100, Math.pow(absDist, 1.7) * 60); // px receding in depth
      const scale = Math.max(0.78, 1.08 - absDist * 0.22); // center item scales up
      const brightness = Math.max(0.72, 1 - absDist * 0.24); // depth lighting
      const opacity = Math.max(0.68, 1 - absDist * 0.22);
      
      // Higher z-index in the center so the front of the cylinder overlaps items behind it
      const zIndex = Math.round(50 - absDist * 25);

      el.style.transform = `perspective(900px) translate3d(0, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.filter = `brightness(${brightness})`;
      el.style.opacity = `${opacity}`;
      el.style.zIndex = `${zIndex}`;
    });
  }, []);

  // Request Animation Frame loop for smooth 60fps cylinder motion
  const requestCylinderUpdate = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(updateCylinderTransforms);
  }, [updateCylinderTransforms]);

  // Sync cylinder on mount, resize, and scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    requestCylinderUpdate();

    const handleScroll = () => {
      requestCylinderUpdate();
    };

    const handleResize = () => {
      requestCylinderUpdate();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [requestCylinderUpdate, allCategories.length]);

  // Center an item smoothly in the cylinder
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const itemOffsetLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScroll = itemOffsetLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScroll),
      behavior,
    });
  }, []);

  // Scroll active category to center on selection or mount
  useEffect(() => {
    const activeIndex = allCategories.indexOf(selectedCategory);
    if (activeIndex !== -1) {
      // Small timeout to allow container layout calculation
      const timer = setTimeout(() => {
        scrollToItem(activeIndex, 'smooth');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, scrollToItem]);

  // Pointer / Touch drag handling with natural cylinder momentum
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
    requestCylinderUpdate();
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    const container = containerRef.current;
    if (!container) return;

    container.style.scrollBehavior = 'smooth';

    // Apply inertia flick momentum if velocity was significant
    if (Math.abs(velocityRef.current) > 3) {
      container.scrollBy({
        left: -velocityRef.current * 18,
        behavior: 'smooth',
      });
    }

    requestCylinderUpdate();
  };

  const handleScrollByStep = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const step = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: step, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-full bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 py-3.5 relative overflow-hidden transition-colors select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center w-full min-w-0">
        {/* Left 3D Cylinder Depth Horizon Vignette */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white via-white/80 dark:from-stone-900 dark:via-stone-900/80 to-transparent z-20 pointer-events-none" />

        {/* Right 3D Cylinder Depth Horizon Vignette */}
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white via-white/80 dark:from-stone-900 dark:via-stone-900/80 to-transparent z-20 pointer-events-none" />

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScrollByStep('left')}
          disabled={!canScrollLeft}
          className={`hidden md:flex absolute left-2 z-30 w-8 h-8 rounded-full bg-white/95 dark:bg-stone-800/95 shadow-md border border-stone-200 dark:border-stone-700 items-center justify-center text-stone-700 dark:text-stone-300 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
            canScrollLeft ? 'opacity-100 hover:text-rose-600' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Cylinder scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 3D Cylindrical Scrollable Drum Stage */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar w-full min-w-0 py-2 cursor-grab active:cursor-grabbing touch-pan-x"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            paddingLeft: 'calc(50% - 44px)',
            paddingRight: 'calc(50% - 44px)',
          }}
          role="tablist"
          aria-label="3D Cylindrical category carousel"
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
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer will-change-transform origin-center transition-all duration-150 py-1"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Circular Food Image with 3D Depth Ring */}
                <div
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all duration-300 ${
                    isSelected
                      ? 'ring-3 ring-rose-500 ring-offset-2 sm:ring-offset-3 dark:ring-offset-stone-900 shadow-lg shadow-rose-500/25 scale-105'
                      : 'ring-1.5 ring-stone-200/90 dark:ring-stone-700/80 group-hover:ring-stone-400 dark:group-hover:ring-stone-500 shadow-xs'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={cat}
                    loading="lazy"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full bg-stone-100 dark:bg-stone-800 pointer-events-none select-none"
                  />

                  {/* 3D Cylindrical Surface Light Reflection */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/30 pointer-events-none" />

                  {/* Active Pulse Orb */}
                  {isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-stone-900 animate-pulse" />
                  )}
                </div>

                {/* Category Label */}
                <span
                  className={`mt-2 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 select-none ${
                    isSelected
                      ? 'text-stone-950 dark:text-white font-black scale-105'
                      : 'text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200 font-medium'
                  }`}
                >
                  {cat}
                </span>

                {/* Active Indicator Underline */}
                <div
                  className={`h-0.5 rounded-full mt-1 transition-all duration-300 ${
                    isSelected
                      ? 'w-8 bg-gradient-to-r from-rose-500 to-amber-500 shadow-xs'
                      : 'w-0 bg-transparent'
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
          className={`hidden md:flex absolute right-2 z-30 w-8 h-8 rounded-full bg-white/95 dark:bg-stone-800/95 shadow-md border border-stone-200 dark:border-stone-700 items-center justify-center text-stone-700 dark:text-stone-300 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
            canScrollRight ? 'opacity-100 hover:text-rose-600' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Cylinder scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CircularCategoryBar;
