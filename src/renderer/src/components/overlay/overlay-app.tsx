import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/components/layout/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

export function OverlayApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{null}</ThemeProvider>
    </QueryClientProvider>
  );
}
