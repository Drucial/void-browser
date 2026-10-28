import type { ReactNode } from "react";
import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { themeQueries } from "@/hooks/theme/theme.queries";
import { useThemeChangedSync } from "@/hooks/theme/use-theme-changed-sync";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useThemeChangedSync();
  const { data } = useQuery(themeQueries.current());
  const isDark = data?.isDark;

  useEffect(() => {
    if (isDark === undefined) return;
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return children;
}
