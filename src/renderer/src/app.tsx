import { BrowserShell } from "@/components/layout/browser-shell";
import { Providers } from "@/components/layout/providers";

export function App() {
  return (
    <Providers>
      <BrowserShell />
    </Providers>
  );
}
