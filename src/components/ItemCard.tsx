import React, { useState } from 'react';
import { Play, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { MenuItem } from '../types';
import SmartPricingBadge from './SmartPricingBadge';
import { getCategoryIcon, getItemImageUrl } from '../services/menuService';

interface ItemCardProps {
  item: MenuItem;
  onOpenVideo?: (videoUrl: string, itemName: string) => void;
  onPreviewImage?: (imageUrl: string, itemName: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onOpenVideo, onPreviewImage }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const categoryIcon = getCategoryIcon(item.category);
  const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim().length > 0);
  const hasCustomImage = Boolean(item.imageUrl && item.imageUrl.trim().length > 0);

  const displayImageUrl = imageError
    ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
    : getItemImageUrl(item);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.videoUrl) return;
    if (onOpenVideo) {
      onOpenVideo(item.videoUrl, item.name);
    } else {
      window.open(item.videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageClick = () => {
    if (onPreviewImage && displayImageUrl) {
      onPreviewImage(displayImageUrl, item.name);
    }
  };

  return (
    <div
      id={`item-card-${item.id}`}
      className="group relative flex flex-col justify-between rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-amber-400/80 transition-all duration-300 overflow-hidden"
    >
      {/* Top Media: Image Container */}
      <div
        className="relative w-full h-44 sm:h-48 overflow-hidden bg-stone-100 cursor-pointer"
        onClick={handleImageClick}
        title="Click to view photo"
      >
        {/* Skeleton shimmer before image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-stone-200/70 animate-pulse flex items-center justify-center text-stone-400">
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

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none" />

        {/* Top Floating Row: Veg Indicator + Category Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {/* 100% Pure Veg Badge */}
            <div
              className="w-4 h-4 rounded-xs border border-emerald-600 flex items-center justify-center p-0.5 bg-white/95 shadow-xs flex-shrink-0"
              title="100% Pure Vegetarian"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
            </div>

            {/* Category Tag */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-900 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs border border-white/40">
              <span>{categoryIcon}</span>
              <span>{item.category}</span>
            </span>
          </div>

          {/* Video Button if present */}
          {hasVideo && (
            <button
              id={`btn-video-${item.id}`}
              type="button"
              onClick={handleVideoClick}
              className="pointer-events-auto inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 bg-white/95 hover:bg-white border border-rose-200/80 px-2.5 py-1 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
              title="Watch Video"
            >
              <Play className="w-3 h-3 fill-rose-600 text-rose-600" />
              <span>Video</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </button>
          )}
        </div>

        {/* Bottom Floating Pill if Column Q has real photo */}
        {hasCustomImage && (
          <div className="absolute bottom-2.5 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-stone-950/70 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Photo
            </span>
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-950 transition-colors">
            {item.name}
          </h3>

          {/* Notes badge */}
          {item.notes && (
            <div className="mt-1.5 flex items-center">
              <span className="inline-flex items-center text-[11px] font-semibold text-stone-600 bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                {item.notes}
              </span>
            </div>
          )}
        </div>

        {/* Footer: Smart Pricing */}
        <div className="pt-3.5 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400">
            Price
          </span>
          <SmartPricingBadge item={item} />
        </div>
      </div>
    </div>
  );
};
export default ItemCard;
