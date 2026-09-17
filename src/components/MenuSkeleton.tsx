import React from 'react';

export const MenuSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Category bar skeleton */}
      <div className="flex items-center gap-2 overflow-hidden mb-8">
        {[60, 80, 70, 90, 65, 85, 75].map((w, idx) => (
          <div
            key={idx}
            className="h-9 rounded-full bg-stone-200/80 animate-pulse flex-shrink-0"
            style={{ width: `${w + 20}px` }}
          />
        ))}
      </div>

      {/* Grid of Skeleton Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white border border-stone-200/70 shadow-xs flex flex-col justify-between overflow-hidden animate-pulse"
          >
            {/* Image placeholder */}
            <div className="w-full h-44 sm:h-48 bg-stone-200/80 relative">
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-stone-300" />
                <div className="w-16 h-5 rounded-full bg-stone-300/80" />
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Title & note skeleton */}
                <div className="space-y-2 mb-3">
                  <div className="w-3/4 h-5 rounded-md bg-stone-200" />
                  <div className="w-1/3 h-4 rounded-md bg-stone-150" />
                </div>
              </div>

              {/* Price skeleton */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="w-10 h-3 rounded bg-stone-200" />
                <div className="w-20 h-6 rounded-md bg-stone-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MenuSkeleton;
