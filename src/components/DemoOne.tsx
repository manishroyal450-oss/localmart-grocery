import React from 'react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

export default function DemoOne() {
  return (
    <>
      <div className="relative h-[200px] w-full max-w-[800px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-stone-500/10 dark:from-rose-500/5 dark:via-amber-500/5 dark:to-stone-900 border border-stone-250/50 dark:border-stone-800 flex items-center justify-center shadow-inner">
        <LiquidButton className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          Liquid Glass
        </LiquidButton>
      </div>
    </>
  );
}
