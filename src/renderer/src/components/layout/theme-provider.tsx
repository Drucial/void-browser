import type { ReactNode } from "react";
import { useEffect, useSyncExternalStore } from "react";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DARK_QUERY);

  mql.addEventListener("change", onChange);

  return () => mql.removeEventListener("change", onChange);
}

function getIsDark() {
  return window.matchMedia(DARK_QUERY).matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useSyncExternalStore(subscribe, getIsDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return children;
}
