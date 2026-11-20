import React from 'react';
import userCafeBannerBg from '../assets/images/user_cafe_banner_original.jpg';

interface ZomatoBannerProps {
  onExploreClick?: () => void;
}

export const ZomatoBanner: React.FC<ZomatoBannerProps> = () => {
  return (
    <section className="w-full pt-3 pb-1 max-w-full overflow-hidden">
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white min-h-[156px] sm:min-h-[196px] flex items-end p-5 sm:p-7 border border-stone-200/40 shadow-sm">
        {/* Cafe Interior Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src={userCafeBannerBg}
            alt="Friends 4 Ever Coffee Cafe Interior"
            className="w-full h-full object-cover object-[center_55%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-stone-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
        </div>

        {/* Banner Editorial Content */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-amber-300/95 mb-1">
              Chandpur · 100% Pure Veg · Dine-in & Takeaway
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white leading-tight [text-wrap:balance]">
              Friends 4 Ever Coffee Cafe
            </h2>
            <p className="text-xs sm:text-sm text-stone-200/95 font-normal max-w-lg mt-1.5 leading-relaxed">
              Handcrafted coffee, stone-baked pizzas, crispy burgers, thick shakes & fresh cafe bites made to order.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-stone-200 bg-stone-950/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shrink-0">
            <span>Open Daily</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="tabular-nums font-semibold text-white">10 AM – 10 PM</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZomatoBanner;
