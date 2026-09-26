import React, { useState } from 'react';
import {
  Star,
  Zap,
  Play,
  ExternalLink,
  Bookmark,
  Image as ImageIcon,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChevronDown,
} from 'lucide-react';
import { MenuItem } from '../types';
import SmartPricingBadge from './SmartPricingBadge';
import { getItemImageUrl, getCategoryIcon } from '../services/menuService';
import { getAvailableVariants, getItemBasePrice } from '../services/cartService';

interface ZomatoDishCardProps {
  item: MenuItem;
  onOpenVideo?: (videoUrl: string, itemName: string) => void;
  onPreviewImage?: (imageUrl: string, itemName: string) => void;
  onAddToCart?: (item: MenuItem, variant?: string, price?: number) => void;
  cartQuantity?: number;
  onUpdateQuantity?: (delta: number) => void;
}

export const ZomatoDishCard: React.FC<ZomatoDishCardProps> = ({
  item,
  onOpenVideo,
  onPreviewImage,
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showVariantPicker, setShowVariantPicker] = useState<boolean>(false);

  const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim().length > 0);
  const displayImageUrl = imageError
    ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    : getItemImageUrl(item);

  const numId =
    typeof item.id === 'number'
      ? item.id
      : parseInt(String(item.id).replace(/\D/g, ''), 10) || 4;
  const rating = (4.1 + ((numId * 7) % 9) / 10).toFixed(1);
  const categoryIcon = getCategoryIcon(item.category);

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
    <div
      id={`zomato-card-${item.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Food Photo Container */}
      <div
        className="relative w-full h-44 sm:h-52 overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onPreviewImage?.(displayImageUrl, item.name)}
        title="Click to view full photo"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-stone-200/60 animate-pulse flex items-center justify-center text-stone-400">
            <ImageIcon className="w-8 h-8 opacity-40" />
          </div>
        )}

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
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Overlay for bottom badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-900 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
            <span>{categoryIcon}</span>
            <span>{item.category}</span>
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Video Link */}
            {hasVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVideo?.(item.videoUrl!, item.name);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-white/95 hover:bg-white px-2.5 py-1 rounded-full shadow-sm cursor-pointer border border-rose-200 active:scale-95"
                title="Watch Video"
              >
                <Play className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                <span>Video</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </button>
            )}

            {/* Bookmark Heart / Save */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
              title="Save dish"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  isSaved ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Floating Bar on Photo (Zomato Style) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between pointer-events-none text-white">
          <div className="flex items-center gap-2">
            {/* 100% Veg Mark */}
            <div className="w-4 h-4 rounded-xs border border-emerald-500 flex items-center justify-center p-0.5 bg-white shadow-xs flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
            </div>
            <span className="text-[11px] font-bold text-white/90 drop-shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Fresh Prep
            </span>
          </div>

          {/* Rating Badge */}
          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-md shadow-sm">
            <Star className="w-3 h-3 fill-white" />
            {rating}
          </span>
        </div>
      </div>

      {/* Card Information */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-rose-600 transition-colors leading-snug">
            {item.name}
          </h3>

          {item.notes && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
              {item.notes}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart Section */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <SmartPricingBadge item={item} />
            </div>

            {/* Interactive Add to Cart or Quantity Adjuster */}
            {cartQuantity > 0 ? (
              <div className="flex items-center rounded-xl bg-stone-900 text-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity?.(-1);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  title="Reduce quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-black text-xs text-white">
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
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-300 hover:border-rose-600 text-xs font-black transition-all duration-200 shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer"
                title="Add to Cart 🛒"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>ADD 🛒</span>
                {hasMultipleVariants && (
                  <ChevronDown className="w-3 h-3 opacity-60" />
                )}
              </button>
            )}
          </div>

          {/* Multiple Variants Picker Popup (Regular/Medium/Large or Half/Full) */}
          {showVariantPicker && hasMultipleVariants && (
            <div className="mt-1 p-2 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
              <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Select Option to Add 🛒
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={(e) => handleSelectVariant(e, v.label, v.price)}
                    className="flex-1 min-w-[70px] py-1 px-2 rounded-lg bg-white hover:bg-rose-600 text-stone-800 hover:text-white border border-stone-200 hover:border-rose-600 text-xs font-bold transition-all shadow-2xs flex items-center justify-between gap-1 cursor-pointer"
                  >
                    <span>{v.label}</span>
                    <span className="text-[11px] font-black">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZomatoDishCard;
