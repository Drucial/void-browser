import { BrowserShell } from "@/components/layout/browser-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

export function App() {
  return (
    <ThemeProvider>
      <BrowserShell />
    </ThemeProvider>
  );
}
