import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'compact' | 'floating';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'segmented',
}) => {
  const { theme, toggleTheme, setTheme, isWaveActive } = useTheme();
  const isDark = theme === 'dark';

  const handleLightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme('light', e);
  };

  const handleDarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme('dark', e);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTheme(e);
  };

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={handleToggleClick}
        id="corner-floating-theme-toggle"
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 py-2 px-3.5 rounded-full shadow-xl border backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-90 group overflow-hidden ${
          isDark
            ? 'bg-stone-900/90 text-amber-300 border-amber-400/40 hover:border-amber-300 hover:bg-stone-850 shadow-amber-900/20'
            : 'bg-white/95 text-stone-800 border-amber-300/60 hover:border-amber-400 hover:bg-amber-50/50 shadow-amber-500/15'
        } ${className}`}
        title={isDark ? 'Wave transition to Light Mode ☀️' : 'Wave transition to Dark Mode 🌙'}
        aria-label="Toggle Dark and Light theme with wave animation"
      >
        <div className="relative">
          {isDark ? (
            <Moon className="w-4 h-4 text-amber-300 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
          )}
          {isWaveActive && (
            <span className="absolute -inset-1 rounded-full animate-ping bg-amber-400/40 pointer-events-none" />
          )}
        </div>
        <span className="text-xs font-black tracking-wide">
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  // Segmented Dual Switch for Corner (shows both Light ☀️ and Dark 🌙 options clearly with wave origin)
  return (
    <div
      id="corner-theme-toggle"
      className={`relative inline-flex items-center p-0.5 sm:p-1 rounded-full bg-stone-100 dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 shadow-2xs backdrop-blur-sm transition-all duration-200 select-none ${className}`}
      role="group"
      aria-label="Theme mode switch with professional wave transition"
    >
      {/* Light Mode Option */}
      <button
        type="button"
        onClick={handleLightClick}
        className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden ${
          !isDark
            ? 'bg-white text-amber-600 shadow-xs ring-1 ring-amber-400/40 scale-100 font-black'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 active:scale-95'
        }`}
        title="Light Mode (Click for sun wave animation) ☀️"
        aria-pressed={!isDark}
      >
        <Sun
          className={`w-3.5 h-3.5 transition-all duration-500 ${
            !isDark
              ? 'text-amber-500 rotate-0 scale-110 animate-[spin_12s_linear_infinite]'
              : 'text-stone-400 -rotate-45'
          }`}
        />
        <span className="text-[11px] sm:text-xs">Light</span>
        {!isDark && (
          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse ml-0.5" />
        )}
      </button>

      {/* Dark Mode Option */}
      <button
        type="button"
        onClick={handleDarkClick}
        className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden ${
          isDark
            ? 'bg-stone-950 text-amber-300 shadow-xs ring-1 ring-amber-400/30 scale-100 font-black'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 active:scale-95'
        }`}
        title="Dark Mode (Click for night wave animation) 🌙"
        aria-pressed={isDark}
      >
        <Moon
          className={`w-3.5 h-3.5 transition-all duration-500 ${
            isDark
              ? 'text-amber-300 rotate-0 scale-110'
              : 'text-stone-400 rotate-12'
          }`}
        />
        <span className="text-[11px] sm:text-xs">Dark</span>
        {isDark && (
          <span className="w-1 h-1 rounded-full bg-amber-300 animate-pulse ml-0.5" />
        )}
      </button>

      {/* Subtle indicator if wave animation is actively propagating */}
      {isWaveActive && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping pointer-events-none"
          title="Wave transition in progress"
        />
      )}
    </div>
  );
};

export default ThemeToggle;
