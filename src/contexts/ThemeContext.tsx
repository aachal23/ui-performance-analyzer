import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolved: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const resolved = useMemo(() => resolveTheme(theme), [theme]);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    const nextResolved = next === 'system' ? getSystemTheme() : next;
    document.documentElement.setAttribute('data-theme', nextResolved);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolved,
    }),
    [theme, resolved]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
