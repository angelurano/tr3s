import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'default';

export const ThemeContext = createContext<{
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  theme: Theme;
}>({
  theme: 'default',
  isDarkMode: false,
  setTheme: () => {}
});

export function useTheme() {
  return useContext(ThemeContext);
}
