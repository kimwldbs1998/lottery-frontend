import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'cenlottery.theme';
export const THEMES = { SRI_LANKA: 'srilanka', SLEEK: 'sleek' };
const DEFAULT_THEME = THEMES.SRI_LANKA;

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === THEMES.SLEEK || saved === THEMES.SRI_LANKA ? saved : DEFAULT_THEME;
  } catch (e) {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
