import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Play,
  Plus,
  Minus,
  ChevronDown,
  Image as ImageIcon,
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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="my-5 relative w-full max-w-full overflow-hidden">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-stone-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Desktop Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Side-Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1.5 w-full min-w-0"
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
          const hasImageFailed = Boolean(failedImages[String(item.id)]);

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
            <article
              key={`horizontal-${item.id}-${idx}`}
              className="w-64 sm:w-72 flex-shrink-0 snap-start group rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Image Container */}
              <div
                className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100 cursor-pointer"
                onClick={() => onPreviewImage?.(imageUrl, item.name)}
                title="Click to view photo"
              >
                {hasImageFailed ? (
                  <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center p-3 text-center">
                    <ImageIcon className="w-7 h-7 text-stone-400 mb-1" />
                    <span className="text-xs font-semibold text-stone-600 line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [String(item.id)]: true }))
                    }
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Top Overlay */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
                  {item.offer ? (
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wide text-white bg-rose-600 px-2 py-0.5 rounded-lg shadow-xs">
                      {item.offer}
                    </span>
                  ) : (
                    <span />
                  )}

                  {hasVideo && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVideo?.(item.videoUrl!, item.name);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-900 bg-white/95 hover:bg-white px-2.5 py-1 rounded-lg shadow-xs cursor-pointer border border-stone-200/80 active:scale-95 transition-all"
                      title="Watch Reel Video"
                    >
                      <Play className="w-3 h-3 fill-rose-600 text-rose-600" />
                      <span>Reel</span>
                    </button>
                  )}
                </div>

                {/* Bottom Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-xs border border-emerald-500 flex items-center justify-center bg-white shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>
                    <span className="text-[11px] font-medium text-white/95 truncate max-w-[150px]">
                      {item.category}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded-md tabular-nums">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    {rating}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                    {item.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                    <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                      <Clock className="w-3 h-3 text-amber-600" />
                      10–15 min
                    </span>
                    {item.notes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate text-stone-500 max-w-[130px]">
                          {item.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <SmartPricingBadge
                        item={item}
                        onSelectVariant={(variantLabel, price) => {
                          onAddToCart?.(item, variantLabel, price);
                        }}
                      />
                    </div>

                    {quantity > 0 ? (
                      <div className="inline-flex items-center rounded-xl bg-stone-900 text-white p-0.5 shadow-xs shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity?.(item, -1);
                          }}
                          className="w-6 h-6 rounded-lg hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                          title="Reduce"
                          aria-label="Reduce quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs tabular-nums text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity?.(item, 1);
                          }}
                          className="w-6 h-6 rounded-lg bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                          title="Add more"
                          aria-label="Add more"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddClick}
                        className="min-h-[34px] inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-bold transition-all active:scale-95 cursor-pointer select-none shrink-0 whitespace-nowrap"
                        title="Add to Cart"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                        {hasMultipleVariants && (
                          <ChevronDown className="w-3 h-3 opacity-70" />
                        )}
                      </button>
                    )}
                  </div>

                  {isPickerOpen && hasMultipleVariants && (
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
                      <span className="block text-[10px] font-semibold text-stone-500 mb-1.5">
                        Select size / option
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {variants.map((v) => (
                          <button
                            key={v.label}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePickerId(null);
                              onAddToCart?.(item, v.label, v.price);
                            }}
                            className="flex-1 min-w-[68px] py-1 px-2 rounded-lg bg-white hover:bg-rose-600 text-stone-800 hover:text-white border border-stone-200 hover:border-rose-600 text-[11px] font-semibold transition-colors flex items-center justify-between gap-1 cursor-pointer tabular-nums"
                          >
                            <span>{v.label}</span>
                            <span className="font-bold">₹{v.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default HorizontalDishesRow;
