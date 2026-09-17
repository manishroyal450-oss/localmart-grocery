import React from 'react';
import { MenuItem } from '../types';

interface SmartPricingBadgeProps {
  item: MenuItem;
}

export const SmartPricingBadge: React.FC<SmartPricingBadgeProps> = ({ item }) => {
  const { standardPrice, halfPrice, fullPrice, regularPrice, mediumPrice, largePrice } = item;

  // Case 1: Pizza sizes (Regular / Medium / Large)
  const hasPizzaSizes = Boolean(regularPrice || mediumPrice || largePrice);

  if (hasPizzaSizes) {
    return (
      <div className="flex flex-wrap items-center gap-1.5" id={`pricing-sizes-${item.id}`}>
        {regularPrice && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100/90 text-amber-950 border border-amber-300 text-xs font-semibold shadow-xs">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider mr-1 px-1 py-0.2 bg-amber-200/80 rounded">R</span>
            <span className="font-bold text-amber-950">₹{regularPrice}</span>
          </div>
        )}
        {mediumPrice && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100/90 text-amber-950 border border-amber-300 text-xs font-semibold shadow-xs">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider mr-1 px-1 py-0.2 bg-amber-200/80 rounded">M</span>
            <span className="font-bold text-amber-950">₹{mediumPrice}</span>
          </div>
        )}
        {largePrice && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100/90 text-amber-950 border border-amber-300 text-xs font-semibold shadow-xs">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider mr-1 px-1 py-0.2 bg-amber-200/80 rounded">L</span>
            <span className="font-bold text-amber-950">₹{largePrice}</span>
          </div>
        )}
      </div>
    );
  }

  // Case 2: Half / Full Portion Badges
  const hasPortionPricing = Boolean(halfPrice || (fullPrice && !standardPrice));

  if (hasPortionPricing) {
    return (
      <div className="flex flex-wrap items-center gap-1.5" id={`pricing-halffull-${item.id}`}>
        {halfPrice && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100/90 text-emerald-950 border border-emerald-300 text-xs font-semibold shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mr-1">Half</span>
            <span className="font-bold text-emerald-950">₹{halfPrice}</span>
          </div>
        )}
        {fullPrice && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100/90 text-emerald-950 border border-emerald-300 text-xs font-semibold shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mr-1">Full</span>
            <span className="font-bold text-emerald-950">₹{fullPrice}</span>
          </div>
        )}
      </div>
    );
  }

  // Case 3: Standard Price (or fallback to fullPrice/any price)
  const displayPrice = standardPrice || fullPrice;

  if (displayPrice) {
    return (
      <div className="inline-flex items-baseline" id={`pricing-standard-${item.id}`}>
        <span className="text-xl font-extrabold text-stone-900 tracking-tight">
          ₹{displayPrice}
        </span>
      </div>
    );
  }

  return (
    <span className="text-xs italic text-stone-400 font-medium" id={`pricing-unlisted-${item.id}`}>
      Price on request
    </span>
  );
};
export default SmartPricingBadge;
