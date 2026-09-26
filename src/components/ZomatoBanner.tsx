import React from 'react';
import { Flame } from 'lucide-react';
import userCafeBannerBg from '../assets/images/user_cafe_banner_original.jpg';

interface ZomatoBannerProps {
  onExploreClick?: () => void;
}

export const ZomatoBanner: React.FC<ZomatoBannerProps> = ({ onExploreClick }) => {
  return (
    <div className="w-full my-2.5 max-w-full overflow-hidden">
      <div className="relative overflow-hidden rounded-2xl bg-stone-950 text-white p-4 sm:p-6 shadow-md border border-stone-800">
        {/* User's Original Cafe Interior Image with Increased Visibility */}
        <div className="absolute inset-0 z-0">
          <img
            src={userCafeBannerBg}
            alt="Friends 4 Ever Coffee Cafe Interior"
            className="w-full h-full object-cover object-[center_55%] opacity-75 contrast-105"
          />
          {/* Subtle balanced dark gradient overlay to highlight colors & keep text readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-black/45 to-stone-950/65" />
        </div>

        {/* Banner Content & Typography */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Friends 4 Ever Coffee Cafe
            </h3>
            <p className="text-xs sm:text-sm text-stone-100 font-medium max-w-lg mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-relaxed">
              Delicious Pizza, Handcrafted Burgers, Cold Drinks, Thick Shakes & Freshly Brewed Hot Coffee!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-stone-950/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-400/40 shadow-md">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Dine-in & Takeaway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZomatoBanner;
