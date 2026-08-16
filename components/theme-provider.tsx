"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "theme";

const ThemeContext = createContext<{
  theme: Theme;
  resolvedTheme: Resolved;
  setTheme: (theme: Theme) => void;
} | null>(null);

function resolveTheme(theme: Theme): Resolved {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: Resolved) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/**
 * Minimal theme provider that avoids next-themes' inline no-flash <script>,
 * which React 19/Next 16 flag as a no-op when a client component re-renders
 * it during hydration (script elements inserted by React aren't executed).
 * Trade-off: a brief flash of the default theme before this mounts.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<Resolved>("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    const resolved = resolveTheme(stored);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, a browser-only external system
    setThemeState(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    if (stored !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = resolveTheme("system");
      setResolvedTheme(next);
      applyTheme(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setThemeState(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
