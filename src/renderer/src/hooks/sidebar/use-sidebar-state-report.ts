import { useEffect } from "react";

import { useSidebar } from "@/components/ui/sidebar";

/** Tells main whenever the sidebar opens or collapses; call inside a `SidebarProvider`. */
export function useSidebarStateReport() {
  const { open } = useSidebar();

  useEffect(() => window.api.reportSidebarOpen(open), [open]);
}
