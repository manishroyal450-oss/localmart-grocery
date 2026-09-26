import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import ThemeWaveOverlay, { WaveData } from '../components/ThemeWaveOverlay';

export type Theme = 'light' | 'dark';

export type ThemeEvent = React.MouseEvent | { clientX: number; clientY: number } | undefined;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: ThemeEvent) => void;
  setTheme: (theme: Theme, event?: ThemeEvent) => void;
  isWaveActive: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyDOMTheme = (t: Theme) => {
  const root = document.documentElement;
  const body = document.body;
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    body?.classList.add('dark');
    body?.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    body?.classList.remove('dark');
    body?.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('friends4ever_theme') as Theme;
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  const [currentWave, setCurrentWave] = useState<WaveData | null>(null);
  const waveCounterRef = useRef(0);
  const isTransitioningRef = useRef(false);

  // Apply initial theme on mount and when theme state changes
  useEffect(() => {
    applyDOMTheme(theme);
    try {
      localStorage.setItem('friends4ever_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleWaveEnd = useCallback((id: number) => {
    setCurrentWave((prev) => (prev?.id === id ? null : prev));
  }, []);

  const triggerThemeTransition = useCallback(
    (targetTheme: Theme, event?: ThemeEvent) => {
      if (targetTheme === theme && !isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 750);

      // Determine the exact origin coordinates of the wave animation
      let x = window.innerWidth - 36;
      let y = 36;

      if (event && 'clientX' in event && typeof event.clientX === 'number' && event.clientX > 0) {
        x = event.clientX;
        y = event.clientY;
      } else {
        // Find corner toggle element
        const cornerElement =
          document.getElementById('corner-theme-toggle') ||
          document.getElementById('header-corner-actions') ||
          document.getElementById('corner-floating-theme-toggle');

        if (cornerElement) {
          const rect = cornerElement.getBoundingClientRect();
          x = Math.round(rect.left + rect.width / 2);
          y = Math.round(rect.top + rect.height / 2);
        }
      }

      // Calculate maximum radius to fully engulf the entire viewport from origin
      const maxRadius =
        Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        ) + 80;

      // Trigger high-fidelity visual wave overlay
      waveCounterRef.current += 1;
      const waveId = waveCounterRef.current;
      setCurrentWave({
        id: waveId,
        x,
        y,
        targetTheme,
        maxRadius,
      });

      // Browser View Transitions API support for circular clip-path wave reveal
      const hasViewTransition =
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (hasViewTransition) {
        try {
          const transition = (document as unknown as { startViewTransition: (cb: () => void) => { ready: Promise<void> } }).startViewTransition(() => {
            applyDOMTheme(targetTheme);
            setThemeState(targetTheme);
          });

          transition.ready
            .then(() => {
              const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
              ];

              document.documentElement.animate(
                {
                  clipPath,
                },
                {
                  duration: 720,
                  easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
                  pseudoElement: '::view-transition-new(root)',
                }
              );
            })
            .catch(() => {
              // Graceful fallback
              applyDOMTheme(targetTheme);
              setThemeState(targetTheme);
            });
          return;
        } catch {
          // If startViewTransition throws, fallback to state update
        }
      }

      // Fallback for browsers without View Transitions
      applyDOMTheme(targetTheme);
      setThemeState(targetTheme);
    },
    [theme]
  );

  const toggleTheme = useCallback(
    (event?: ThemeEvent) => {
      const nextTheme = theme === 'light' ? 'dark' : 'light';
      triggerThemeTransition(nextTheme, event);
    },
    [theme, triggerThemeTransition]
  );

  const setTheme = useCallback(
    (newTheme: Theme, event?: ThemeEvent) => {
      triggerThemeTransition(newTheme, event);
    },
    [triggerThemeTransition]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isWaveActive: Boolean(currentWave),
      }}
    >
      {children}
      {/* Global Wave Animation Overlay */}
      <ThemeWaveOverlay currentWave={currentWave} onWaveEnd={handleWaveEnd} />
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
