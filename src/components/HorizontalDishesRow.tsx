import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Play,
  ExternalLink,
  Sparkles,
  ShoppingCart,
  Plus,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { MenuItem } from '../types';
import SmartPricingBadge from './SmartPricingBadge';
import { getItemImageUrl } from '../services/menuService';
import { getAvailableVariants } from '../services/cartService';

interface HorizontalDishesRowProps {
  title: string;
  subtitle?: string;
  items: MenuItem[];
  onOpenVideo?: (videoUrl: string, itemName: string) => void;
  onPreviewImage?: (imageUrl: string, itemName: string) => void;
  onAddToCart?: (item: MenuItem, variant?: string, price?: number) => void;
  getItemQuantity?: (itemId: string | number) => number;
  onUpdateQuantity?: (item: MenuItem, delta: number) => void;
}

export const HorizontalDishesRow: React.FC<HorizontalDishesRowProps> = ({
  title,
  subtitle,
  items,
  onOpenVideo,
  onPreviewImage,
  onAddToCart,
  getItemQuantity,
  onUpdateQuantity,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePickerId, setActivePickerId] = useState<string | number | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="my-6 relative w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-white uppercase">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5 ml-4">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-750 transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-750 transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Side-Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 w-full min-w-0"
      >
        {items.map((item, idx) => {
          const imageUrl = getItemImageUrl(item);
          const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim().length > 0);
          const numId =
            typeof item.id === 'number'
              ? item.id
              : parseInt(String(item.id).replace(/\D/g, ''), 10) || 4;
          const rating = (4.0 + ((numId * 7) % 10) / 10).toFixed(1);
          const quantity = getItemQuantity ? getItemQuantity(item.id) : 0;
          const variants = getAvailableVariants(item);
          const hasMultipleVariants = variants.length > 1;
          const isPickerOpen = activePickerId === item.id;

          const handleAddClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasMultipleVariants) {
              setActivePickerId(isPickerOpen ? null : item.id);
            } else {
              const defaultVariant = variants[0];
              onAddToCart?.(item, defaultVariant?.label, defaultVariant?.price);
            }
          };

          return (
            <div
              key={`horizontal-${item.id}-${idx}`}
              className="w-64 sm:w-72 flex-shrink-0 snap-start group rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Image Container */}
              <div
                className="relative w-full h-40 sm:h-44 overflow-hidden bg-stone-100 dark:bg-stone-850 cursor-pointer"
                onClick={() => onPreviewImage?.(imageUrl, item.name)}
                title="Click to view photo"
              >
                <img
                  src={imageUrl}
                  alt={item.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 pointer-events-none" />

                {/* Top Overlay: Offer or Chef Tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-white bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    Spotlight
                  </span>
                </div>

                {/* Video Button */}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVideo?.(item.videoUrl!, item.name);
                    }}
                    className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-white/95 hover:bg-white px-2.5 py-1 rounded-full shadow-sm cursor-pointer border border-rose-100 active:scale-95"
                    title="Watch Video"
                  >
                    <Play className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                    <span>Video</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </button>
                )}

                {/* Bottom Overlay: Dish Name & Veg Indicator */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    {/* Veg Square */}
                    <div className="w-3.5 h-3.5 rounded-xs border border-emerald-500 flex items-center justify-center p-0.5 bg-white shadow-xs flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md truncate max-w-[170px]">
                      {item.category}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded-md shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    {rating}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.name}
                  </h3>

                  {/* Prep time & Notes */}
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center gap-0.5 text-stone-600 dark:text-stone-300 font-medium">
                      <Zap className="w-3 h-3 text-amber-500" />
                      10-15 mins
                    </span>
                    {item.notes && (
                      <>
                        <span className="text-stone-300 dark:text-stone-600">•</span>
                        <span className="truncate text-stone-500 dark:text-stone-400 max-w-[120px]">
                          {item.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <SmartPricingBadge item={item} />
                    </div>

                    {quantity > 0 ? (
                      <div className="relative inline-flex items-center rounded-[20px] bg-stone-900/95 dark:bg-stone-850/95 text-white p-0.5 shadow-md border border-stone-700/80 animate-droplet-btn">
                        <span className="absolute top-0.5 left-2 w-2.5 h-1 bg-white/40 rounded-full blur-[0.2px] pointer-events-none" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity?.(item, -1);
                          }}
                          className="w-5 h-5 rounded-full hover:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                          title="Reduce"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-black text-xs text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity?.(item, 1);
                          }}
                          className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors cursor-pointer active:scale-90 shadow-2xs"
                          title="Add more"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddClick}
                        className="relative inline-flex items-center gap-1 px-3 py-1.5 rounded-[22px] bg-gradient-to-br from-rose-50 via-rose-100/90 to-rose-200/70 dark:from-rose-950/80 dark:via-rose-900/60 dark:to-stone-900 text-rose-600 dark:text-rose-300 hover:text-white dark:hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-300/80 dark:border-rose-750/70 text-[11px] font-black transition-all duration-300 shadow-[0_4px_12px_rgba(225,29,72,0.18),inset_0_2px_4px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(0,0,0,0.06)] hover:shadow-rose-500/25 active:scale-90 animate-droplet-btn cursor-pointer select-none group"
                        title="Add to Cart 🛒"
                      >
                        {/* Specular Droplet Water Glare */}
                        <span className="absolute top-0.5 left-2 w-3 h-1 bg-white/80 rounded-full blur-[0.2px] pointer-events-none" />
                        <span className="absolute bottom-0.5 right-2 w-1.5 h-0.5 bg-white/40 rounded-full pointer-events-none" />

                        <ShoppingCart className="w-3 h-3 transition-transform group-hover:scale-110" />
                        <span className="tracking-tight">ADD 🛒</span>
                        {hasMultipleVariants && (
                          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Variant Selector Popup */}
                  {isPickerOpen && hasMultipleVariants && (
                    <div className="p-1.5 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-750 animate-in fade-in zoom-in-95 duration-150">
                      <span className="block text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                        Select Option 🛒
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {variants.map((v) => (
                          <button
                            key={v.label}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePickerId(null);
                              onAddToCart?.(item, v.label, v.price);
                            }}
                            className="flex-1 min-w-[60px] py-0.5 px-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-rose-600 dark:hover:bg-rose-600 text-stone-800 dark:text-stone-200 hover:text-white dark:hover:text-white border border-stone-200 dark:border-stone-700 hover:border-rose-600 text-[10px] font-bold transition-all shadow-2xs flex items-center justify-between gap-1 cursor-pointer"
                          >
                            <span>{v.label}</span>
                            <span className="font-black">₹{v.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HorizontalDishesRow;
