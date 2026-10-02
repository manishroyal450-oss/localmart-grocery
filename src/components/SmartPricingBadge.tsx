import React from 'react';
import { MenuItem } from '../types';
import { Tag } from 'lucide-react';

interface SmartPricingBadgeProps {
  item: MenuItem;
}

export const SmartPricingBadge: React.FC<SmartPricingBadgeProps> = ({ item }) => {
  const { standardPrice, halfPrice, fullPrice, regularPrice, mediumPrice, largePrice, offer } = item;

  // Case 1: Pizza sizes (Regular / Medium / Large)
  const hasPizzaSizes = Boolean(regularPrice || mediumPrice || largePrice);

  const renderOfferBadge = () => {
    if (!offer) return null;
    return (
      <div
        id={`offer-badge-${item.id}`}
        className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-orange-500/15 dark:from-rose-950/60 dark:via-amber-950/60 dark:to-orange-950/60 border border-rose-300/80 dark:border-rose-700/80 text-[11px] font-black text-rose-600 dark:text-rose-400 shadow-2xs tracking-wide select-none"
        title={`Special Owner Offer: ${offer}`}
      >
        <Tag className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
        <span className="font-extrabold uppercase">{offer}</span>
      </div>
    );
  };

  if (hasPizzaSizes) {
    return (
      <div className="flex flex-col items-start gap-0.5" id={`pricing-sizes-container-${item.id}`}>
        <div className="flex flex-wrap items-center gap-1.5" id={`pricing-sizes-${item.id}`}>
          {regularPrice && (
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold shadow-xs">
              <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider mr-1 px-1 py-0.2 bg-amber-200/80 dark:bg-amber-900/60 rounded">R</span>
              <span className="font-bold">₹{regularPrice}</span>
            </div>
          )}
          {mediumPrice && (
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold shadow-xs">
              <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider mr-1 px-1 py-0.2 bg-amber-200/80 dark:bg-amber-900/60 rounded">M</span>
              <span className="font-bold">₹{mediumPrice}</span>
            </div>
          )}
          {largePrice && (
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold shadow-xs">
              <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider mr-1 px-1 py-0.2 bg-amber-200/80 dark:bg-amber-900/60 rounded">L</span>
              <span className="font-bold">₹{largePrice}</span>
            </div>
          )}
        </div>
        {/* Owner Special Offer shown right below the prices */}
        {renderOfferBadge()}
      </div>
    );
  }

  // Case 2: Half / Full Portion Badges
  const hasPortionPricing = Boolean(halfPrice || (fullPrice && !standardPrice));

  if (hasPortionPricing) {
    return (
      <div className="flex flex-col items-start gap-0.5" id={`pricing-halffull-container-${item.id}`}>
        <div className="flex flex-wrap items-center gap-1.5" id={`pricing-halffull-${item.id}`}>
          {halfPrice && (
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mr-1">Half</span>
              <span className="font-bold">₹{halfPrice}</span>
            </div>
          )}
          {fullPrice && (
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mr-1">Full</span>
              <span className="font-bold">₹{fullPrice}</span>
            </div>
          )}
        </div>
        {/* Owner Special Offer shown right below the prices */}
        {renderOfferBadge()}
      </div>
    );
  }

  // Case 3: Standard Price (or fallback to fullPrice/any price)
  const displayPrice = standardPrice || fullPrice;

  if (displayPrice) {
    return (
      <div className="flex flex-col items-start" id={`pricing-standard-container-${item.id}`}>
        <div className="inline-flex items-baseline" id={`pricing-standard-${item.id}`}>
          <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            ₹{displayPrice}
          </span>
        </div>
        {/* Owner Special Offer shown right below the price */}
        {renderOfferBadge()}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start" id={`pricing-unlisted-container-${item.id}`}>
      <span className="text-xs italic text-stone-400 font-medium" id={`pricing-unlisted-${item.id}`}>
        Price on request
      </span>
      {renderOfferBadge()}
    </div>
  );
};

export default SmartPricingBadge;
