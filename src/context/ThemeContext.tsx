import React, { createContext, useContext, useEffect, useCallback } from 'react';

export type Theme = 'light';

export type ThemeEvent = React.MouseEvent | React.PointerEvent | { clientX: number; clientY: number } | undefined;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: ThemeEvent) => void;
  setTheme: (theme: Theme, event?: ThemeEvent) => void;
  isWaveActive: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const enforceLightDOMTheme = () => {
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove('dark');
  root.classList.add('light');
  body?.classList.remove('dark');
  body?.classList.add('light');
  root.setAttribute('data-theme', 'light');
  root.style.colorScheme = 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    enforceLightDOMTheme();
    try {
      localStorage.setItem('friends4ever_theme', 'light');
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback(() => {
    enforceLightDOMTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    enforceLightDOMTheme();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
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
