import { useEffect, useState, type ReactNode } from "react";
import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type ThemeMode,
} from "./ThemeContext";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage indisponivel: segue o sistema
  }
  return "system";
}

function applyTheme(theme: ThemeMode) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function setTheme(next: ThemeMode) {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // sem persistencia: vale so nesta sessao
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
