import React from 'react';
import { MenuItem } from '../types';
import { Tag, Plus } from 'lucide-react';

interface SmartPricingBadgeProps {
  item: MenuItem;
  onSelectVariant?: (variantLabel: string, price: number) => void;
  variantQuantities?: Record<string, number>;
}

export const SmartPricingBadge: React.FC<SmartPricingBadgeProps> = ({
  item,
  onSelectVariant,
  variantQuantities,
}) => {
  const { standardPrice, halfPrice, fullPrice, regularPrice, mediumPrice, largePrice, offer } = item;

  const hasPizzaSizes = Boolean(regularPrice || mediumPrice || largePrice);

  const renderOfferBadge = () => {
    if (!offer) return null;
    return (
      <div
        id={`offer-badge-${item.id}`}
        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700"
        title={`Special Owner Offer: ${offer}`}
      >
        <Tag className="w-3 h-3 text-rose-600 shrink-0" />
        <span>{offer}</span>
      </div>
    );
  };

  if (hasPizzaSizes) {
    const sizeOptions = [
      { key: 'Regular', short: 'R', price: regularPrice },
      { key: 'Medium', short: 'M', price: mediumPrice },
      { key: 'Large', short: 'L', price: largePrice },
    ].filter((opt) => Boolean(opt.price));

    return (
      <div className="flex flex-col items-start gap-0.5" id={`pricing-sizes-container-${item.id}`}>
        <div className="flex flex-wrap items-center gap-1.5" id={`pricing-sizes-${item.id}`}>
          {sizeOptions.map((opt) => {
            const qty = variantQuantities?.[opt.key] || 0;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVariant?.(opt.key, Number(opt.price));
                }}
                title={`Click to add ${opt.key} size to cart`}
                className={`group/btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 border tabular-nums ${
                  qty > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-500 ring-1 ring-rose-400/50'
                    : 'bg-stone-50 hover:bg-rose-50/70 text-stone-800 border-stone-200 hover:border-rose-300'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase px-1 py-0.2 rounded ${
                    qty > 0
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-200/80 text-stone-700 group-hover/btn:bg-rose-600 group-hover/btn:text-white transition-colors'
                  }`}
                >
                  {opt.short}
                </span>
                <span className="font-bold">₹{opt.price}</span>
                {qty > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full leading-none">
                    {qty}
                  </span>
                ) : (
                  <Plus className="w-2.5 h-2.5 text-stone-400 group-hover/btn:text-rose-600 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
        {renderOfferBadge()}
      </div>
    );
  }

  const hasPortionPricing = Boolean(halfPrice || (fullPrice && !standardPrice));

  if (hasPortionPricing) {
    const portionOptions = [
      { key: 'Half', price: halfPrice },
      { key: 'Full', price: fullPrice },
    ].filter((opt) => Boolean(opt.price));

    return (
      <div className="flex flex-col items-start gap-0.5" id={`pricing-halffull-container-${item.id}`}>
        <div className="flex flex-wrap items-center gap-1.5" id={`pricing-halffull-${item.id}`}>
          {portionOptions.map((opt) => {
            const qty = variantQuantities?.[opt.key] || 0;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVariant?.(opt.key, Number(opt.price));
                }}
                title={`Click to add ${opt.key} portion to cart`}
                className={`group/btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 border tabular-nums ${
                  qty > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-1 ring-emerald-400/50'
                    : 'bg-stone-50 hover:bg-emerald-50/70 text-stone-800 border-stone-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                  {opt.key}
                </span>
                <span className="font-bold">₹{opt.price}</span>
                {qty > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full leading-none">
                    {qty}
                  </span>
                ) : (
                  <Plus className="w-2.5 h-2.5 text-stone-400 group-hover/btn:text-emerald-600 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
        {renderOfferBadge()}
      </div>
    );
  }

  const displayPrice = standardPrice || fullPrice;

  if (displayPrice) {
    return (
      <div className="flex flex-col items-start" id={`pricing-standard-container-${item.id}`}>
        <div className="inline-flex items-baseline" id={`pricing-standard-${item.id}`}>
          <span className="text-lg font-extrabold text-stone-900 tracking-tight tabular-nums">
            ₹{displayPrice}
          </span>
        </div>
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
