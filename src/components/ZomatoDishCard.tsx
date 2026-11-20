import React, { useState } from 'react';
import {
  Star,
  Play,
  Bookmark,
  Image as ImageIcon,
  Plus,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { MenuItem } from '../types';
import SmartPricingBadge from './SmartPricingBadge';
import { getItemImageUrl } from '../services/menuService';
import { getAvailableVariants } from '../services/cartService';

interface ZomatoDishCardProps {
  item: MenuItem;
  onOpenVideo?: (videoUrl: string, itemName: string) => void;
  onPreviewImage?: (imageUrl: string, itemName: string) => void;
  onAddToCart?: (item: MenuItem, variant?: string, price?: number) => void;
  cartQuantity?: number;
  onUpdateQuantity?: (delta: number) => void;
  variantQuantities?: Record<string, number>;
}

export const ZomatoDishCard: React.FC<ZomatoDishCardProps> = ({
  item,
  onOpenVideo,
  onPreviewImage,
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  variantQuantities,
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showVariantPicker, setShowVariantPicker] = useState<boolean>(false);

  const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim().length > 0);
  const displayImageUrl = getItemImageUrl(item);

  const numId =
    typeof item.id === 'number'
      ? item.id
      : parseInt(String(item.id).replace(/\D/g, ''), 10) || 4;
  const rating = (4.1 + ((numId * 7) % 9) / 10).toFixed(1);

  const variants = getAvailableVariants(item);
  const hasMultipleVariants = variants.length > 1;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleVariants) {
      setShowVariantPicker((prev) => !prev);
    } else {
      const defaultVariant = variants[0];
      onAddToCart?.(item, defaultVariant?.label, defaultVariant?.price);
    }
  };

  const handleSelectVariant = (
    e: React.MouseEvent,
    variantLabel: string,
    variantPrice: number
  ) => {
    e.stopPropagation();
    setShowVariantPicker(false);
    onAddToCart?.(item, variantLabel, variantPrice);
  };

  return (
    <article
      id={`zomato-card-${item.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Food Photography */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onPreviewImage?.(displayImageUrl, item.name)}
        title="Click to view full photo"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-stone-100 animate-shimmer flex items-center justify-center text-stone-300">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}

        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="w-8 h-8 text-stone-400 mb-1.5" />
            <span className="text-xs font-semibold text-stone-600 line-clamp-1">{item.name}</span>
          </div>
        ) : (
          <img
            src={displayImageUrl}
            alt={item.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Measured Scrim for Bottom Metadata */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Top Corner Controls: Offer / Reel / Bookmark */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          {item.offer ? (
            <span className="inline-flex items-center text-[10px] font-bold text-white bg-rose-600 px-2.5 py-1 rounded-lg shadow-xs tracking-wide uppercase">
              {item.offer}
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5 pointer-events-auto">
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className="w-8 h-8 rounded-lg bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
              title="Save dish"
              aria-label="Save dish"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Scrim Metadata: Pure Veg Mark & Tabular Rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none text-white">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-xs border border-emerald-500 flex items-center justify-center bg-white shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <span className="text-[11px] font-medium text-white/95">Pure Veg</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-md tabular-nums">
            <Star className="w-3 h-3 fill-white" />
            {rating}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-0.5">
            {item.category}
          </p>
          <h3 className="text-base font-bold text-stone-900 group-hover:text-rose-600 transition-colors leading-snug">
            {item.name}
          </h3>
          {item.notes && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {item.notes}
            </p>
          )}
        </div>

        {/* Pricing & Add Action */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <SmartPricingBadge
                item={item}
                onSelectVariant={(variantLabel, price) => {
                  onAddToCart?.(item, variantLabel, price);
                }}
                variantQuantities={variantQuantities}
              />
            </div>

            {hasMultipleVariants ? (
              <button
                type="button"
                onClick={handleAddClick}
                className={`min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer select-none shrink-0 whitespace-nowrap ${
                  cartQuantity > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600'
                }`}
                title={
                  cartQuantity > 0
                    ? `${cartQuantity} in cart · Click to select size`
                    : 'Select size to add to cart'
                }
              >
                <span className="tabular-nums">
                  {cartQuantity > 0 ? `Add (${cartQuantity})` : 'Add'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    showVariantPicker ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : cartQuantity > 0 ? (
              <div className="inline-flex items-center rounded-xl bg-stone-900 text-white p-0.5 shadow-xs shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity?.(-1);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  title="Reduce quantity"
                  aria-label="Reduce quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs tabular-nums text-white">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity?.(1);
                  }}
                  className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  title="Add more"
                  aria-label="Add more"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="min-h-[36px] inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-bold transition-all active:scale-95 cursor-pointer select-none shrink-0 whitespace-nowrap"
                title="Add to Cart"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          {/* Multi-Variant Selector */}
          {showVariantPicker && hasMultipleVariants && (
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/90 animate-in fade-in zoom-in-95 duration-150">
              <span className="block text-[11px] font-semibold text-stone-500 mb-2">
                Choose size / portion
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => {
                  const vQty = variantQuantities?.[v.label] || 0;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      onClick={(e) => handleSelectVariant(e, v.label, v.price)}
                      className={`flex-1 min-w-[78px] py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between gap-1.5 cursor-pointer active:scale-95 tabular-nums ${
                        vQty > 0
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white hover:bg-rose-50 text-stone-800 border-stone-200 hover:border-rose-300'
                      }`}
                      title={`Add ${v.label} (₹${v.price}) to cart`}
                    >
                      <span>{v.label}</span>
                      <span className="font-bold">
                        ₹{v.price} {vQty > 0 ? `(${vQty})` : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ZomatoDishCard;
