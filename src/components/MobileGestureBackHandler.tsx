import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

interface MobileGestureBackHandlerProps {
  onBack: () => boolean;
  enabled?: boolean;
}

export const MobileGestureBackHandler: React.FC<MobileGestureBackHandlerProps> = ({
  onBack,
  enabled = true,
}) => {
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);

  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isEdgeSwipeRef = useRef<boolean>(false);
  const hasTriggeredHapticRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Detect if swipe starts from the left edge of the phone screen (0 to 35px)
      if (touch.clientX <= 35) {
        startXRef.current = touch.clientX;
        startYRef.current = touch.clientY;
        isEdgeSwipeRef.current = true;
        hasTriggeredHapticRef.current = false;
        setStartY(touch.clientY);
      } else {
        isEdgeSwipeRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEdgeSwipeRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = Math.abs(touch.clientY - startYRef.current);

      // Require primarily horizontal swipe
      if (deltaX > 8 && deltaX > deltaY * 0.8) {
        // Clamp progress between 0 and 1 (threshold is 70px)
        const progress = Math.min(Math.max((deltaX - 8) / 70, 0), 1);
        setIsSwiping(true);
        setSwipeProgress(progress);

        // Haptic feedback once threshold is reached
        if (progress >= 1 && !hasTriggeredHapticRef.current) {
          hasTriggeredHapticRef.current = true;
          try {
            if (navigator.vibrate) navigator.vibrate(15);
          } catch {
            // ignore
          }
        }
      } else if (deltaY > deltaX && deltaY > 30) {
        // Cancel if moving predominantly vertically
        isEdgeSwipeRef.current = false;
        setIsSwiping(false);
        setSwipeProgress(0);
      }
    };

    const handleTouchEnd = () => {
      if (isEdgeSwipeRef.current && isSwiping) {
        if (swipeProgress >= 0.75) {
          try {
            if (navigator.vibrate) navigator.vibrate([10, 30]);
          } catch {
            // ignore
          }
          onBack();
        }
      }
      isEdgeSwipeRef.current = false;
      setIsSwiping(false);
      setSwipeProgress(0);
      hasTriggeredHapticRef.current = false;
    };

    const handleTouchCancel = () => {
      isEdgeSwipeRef.current = false;
      setIsSwiping(false);
      setSwipeProgress(0);
      hasTriggeredHapticRef.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, onBack, isSwiping, swipeProgress]);

  if (!isSwiping || swipeProgress <= 0.05) return null;

  const pillWidth = 36 + swipeProgress * 20;
  const isReady = swipeProgress >= 0.75;
  const safeTop = Math.max(80, Math.min(window.innerHeight - 100, startY || window.innerHeight / 2));

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 z-50 pointer-events-none select-none transition-transform"
      style={{
        top: `${safeTop}px`,
        transform: 'translateY(-50%)',
      }}
    >
      {/* Native-style Back Arrow Pill coming out from the left edge */}
      <div
        className={`flex items-center justify-center rounded-r-full shadow-2xl transition-all duration-75 border-y border-r ${
          isReady
            ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/40 scale-105'
            : 'bg-stone-900/90 dark:bg-stone-800/90 text-white border-stone-700/80 shadow-black/40'
        }`}
        style={{
          width: `${pillWidth}px`,
          height: '48px',
          paddingLeft: '6px',
          opacity: 0.4 + swipeProgress * 0.6,
        }}
      >
        <ChevronLeft
          className={`w-6 h-6 transition-transform ${isReady ? 'scale-125' : ''}`}
        />
      </div>
    </div>
  );
};

export default MobileGestureBackHandler;
