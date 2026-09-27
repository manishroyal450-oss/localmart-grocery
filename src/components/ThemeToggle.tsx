import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'compact' | 'floating';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'segmented',
}) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleLightTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme('light');
  };

  const handleDarkTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme('dark');
  };

  const handleToggleTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTheme();
  };

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={handleToggleTrigger}
        id="corner-floating-theme-toggle"
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 py-2 px-3.5 rounded-full shadow-lg border backdrop-blur-md transition-colors duration-200 cursor-pointer active:scale-95 group touch-manipulation ${
          isDark
            ? 'bg-stone-900/90 text-amber-300 border-stone-750 hover:bg-stone-850'
            : 'bg-white/90 text-stone-800 border-stone-200 hover:bg-stone-50'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
        aria-label="Toggle Dark and Light theme"
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-300 transition-transform duration-200 group-hover:rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 group-hover:rotate-45" />
        )}
        <span className="text-xs font-bold tracking-wide">
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  // Segmented Dual Switch for Corner - Clean, normal, zero-glitch transition
  return (
    <div
      id="corner-theme-toggle"
      className={`relative inline-flex items-center p-0.5 sm:p-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs transition-colors duration-200 select-none ${className}`}
      role="group"
      aria-label="Theme mode switch"
    >
      {/* Light Mode Option */}
      <button
        type="button"
        onClick={handleLightTrigger}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          !isDark
            ? 'bg-white text-amber-600 shadow-xs ring-1 ring-stone-200/80'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
        }`}
        title="Light Mode ☀️"
        aria-pressed={!isDark}
      >
        <Sun
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            !isDark ? 'text-amber-500' : 'text-stone-400'
          }`}
        />
        <span className="text-[11px] sm:text-xs">Light</span>
      </button>

      {/* Dark Mode Option */}
      <button
        type="button"
        onClick={handleDarkTrigger}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          isDark
            ? 'bg-stone-900 text-amber-300 shadow-xs ring-1 ring-stone-700'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
        }`}
        title="Dark Mode 🌙"
        aria-pressed={isDark}
      >
        <Moon
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isDark ? 'text-amber-300' : 'text-stone-400'
          }`}
        />
        <span className="text-[11px] sm:text-xs">Dark</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
