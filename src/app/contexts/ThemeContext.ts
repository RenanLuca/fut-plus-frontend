import { createContext } from "react";

export type ThemeMode = "system" | "light" | "dark";

export type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

export const THEME_STORAGE_KEY = "fut-plus-theme";

export const ThemeContext = createContext<ThemeContextValue | null>(null);
