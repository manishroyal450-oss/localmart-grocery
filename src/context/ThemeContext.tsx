import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export type ThemeEvent = React.MouseEvent | React.PointerEvent | { clientX: number; clientY: number } | undefined;

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

  // Apply initial theme on mount and when theme state changes
  useEffect(() => {
    applyDOMTheme(theme);
    try {
      localStorage.setItem('friends4ever_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((targetTheme: Theme) => {
    applyDOMTheme(targetTheme);
    setThemeState(targetTheme);
    try {
      localStorage.setItem('friends4ever_theme', targetTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isWaveActive: false,
      }}
    >
      {children}
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
