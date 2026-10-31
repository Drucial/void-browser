import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/components/layout/theme-provider";

import { PaletteHost } from "./palette-host";
import { ToastHost } from "./toast-host";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

export function OverlayApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastHost />
        <PaletteHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
