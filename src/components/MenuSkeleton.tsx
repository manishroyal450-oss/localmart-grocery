import React from 'react';

export const MenuSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between overflow-hidden"
          >
            <div className="w-full aspect-[4/3] bg-stone-200/70 animate-shimmer" />
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="w-16 h-3 rounded bg-stone-200" />
                <div className="w-3/4 h-4 rounded bg-stone-200" />
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="w-14 h-5 rounded bg-stone-200" />
                <div className="w-16 h-8 rounded-xl bg-stone-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSkeleton;
