import React, { useRef, useState, useCallback } from 'react';

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'rose' | 'amber' | 'emerald' | 'cyan' | 'ghost';
  size?: 'pill' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  isActive?: boolean;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      size = 'md',
      glow = true,
      isActive = false,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    }, []);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      setMousePos({ x: 50, y: 50 });
    };

    // Size variants
    const sizeClasses = {
      pill: 'px-4 py-1.5 text-xs rounded-full min-h-[36px]',
      sm: 'px-3.5 py-1.5 text-xs rounded-full min-h-[34px]',
      md: 'px-5 py-2.5 text-sm rounded-full min-h-[42px]',
      lg: 'px-7 py-3 text-base rounded-full min-h-[50px]',
      xl: 'px-8 py-3.5 text-lg rounded-full min-h-[56px]',
    }[size];

    // Color theme variants based on active state and variant
    const getVariantStyles = () => {
      if (isActive) {
        switch (variant) {
          case 'rose':
            return {
              container:
                'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white border-rose-400/80 shadow-[0_10px_25px_-5px_rgba(225,29,72,0.45),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.25)] font-black',
              glow: 'rgba(244, 63, 94, 0.55)',
              highlight: 'rgba(255, 255, 255, 0.7)',
            };
          case 'amber':
            return {
              container:
                'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white border-amber-400/80 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.45),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.25)] font-black',
              glow: 'rgba(245, 158, 11, 0.55)',
              highlight: 'rgba(255, 255, 255, 0.7)',
            };
          case 'emerald':
            return {
              container:
                'bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-emerald-400/80 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.45),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.25)] font-black',
              glow: 'rgba(16, 185, 129, 0.55)',
              highlight: 'rgba(255, 255, 255, 0.7)',
            };
          case 'default':
          default:
            return {
              container:
                'bg-stone-900 dark:bg-white text-white dark:text-stone-950 border-stone-700 dark:border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.3)] font-black',
              glow: 'rgba(0, 0, 0, 0.4)',
              highlight: 'rgba(255, 255, 255, 0.6)',
            };
        }
      }

      // Inactive: Realistic Ali Imam Liquid Glass appearance (Image 2)
      return {
        container:
          'bg-white/75 dark:bg-stone-850/75 text-stone-800 dark:text-stone-200 border-white/90 dark:border-stone-700/80 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.18),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.1)] hover:bg-white/90 dark:hover:bg-stone-800/90 hover:text-stone-950 dark:hover:text-white',
        glow: 'rgba(255, 255, 255, 0.5)',
        highlight: 'rgba(255, 255, 255, 0.85)',
      };
    };

    const styles = getVariantStyles();

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        disabled={disabled}
        className={`relative inline-flex items-center justify-center font-bold tracking-tight select-none overflow-hidden backdrop-blur-xl border transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none group ${sizeClasses} ${styles.container} ${className}`}
        style={{
          boxShadow:
            glow && isHovered && !isActive
              ? `0 12px 30px -4px rgba(0,0,0,0.2), inset 0 2.5px 5px rgba(255, 255, 255, 0.95), inset 0 -2.5px 5px rgba(0, 0, 0, 0.12)`
              : undefined,
        }}
        {...props}
      >
        {/* Specular Liquid Cursor Follower */}
        <span
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-full"
          style={{
            background: `radial-gradient(circle 60px at ${mousePos.x}% ${mousePos.y}%, ${styles.highlight} 0%, transparent 70%)`,
            opacity: isHovered ? 0.9 : 0.25,
          }}
        />

        {/* Curved Top Specular Glare (Glass Reflection from Image 2) */}
        <span className="absolute top-0.5 left-2 right-2 h-[45%] bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-t-full pointer-events-none" />

        {/* Liquid Bottom Prism Dark Bevel Rim */}
        <span className="absolute bottom-0.5 left-2 right-2 h-[35%] bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-b-full pointer-events-none" />

        {/* Micro Liquid Rim Highlight */}
        <span
          className={`absolute inset-0 rounded-full border border-white/60 dark:border-white/25 pointer-events-none transition-opacity duration-300 ${
            isHovered || isActive ? 'opacity-100' : 'opacity-40'
          }`}
        />

        {/* Button Content */}
        <span className="relative z-10 flex items-center gap-1.5 drop-shadow-xs transition-transform duration-200 group-hover:scale-[1.02]">
          {children}
        </span>
      </button>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export default LiquidButton;
