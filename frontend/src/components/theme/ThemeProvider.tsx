import { ThemeContext, type Theme } from '@/context/theme';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'default';

    const stored = localStorage.getItem('theme-darkmode');
    if (
      (stored && stored === 'light') ||
      stored === 'dark' ||
      stored === 'default'
    )
      return stored;

    return 'default';
  };

  const [theme, setTheme] = useState<'light' | 'dark' | 'default'>(
    getInitialTheme()
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme-darkmode', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (isWindowDarkMode: boolean) => {
      const darkMode =
        theme === 'dark' || (theme === 'default' && isWindowDarkMode);
      setIsDarkMode(darkMode);
      if (darkMode) {
        if (!document.documentElement.classList.contains('dark'))
          document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      updateTheme(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    updateTheme(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
