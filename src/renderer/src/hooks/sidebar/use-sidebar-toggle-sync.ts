import { useEffect } from "react";

import { useSidebar } from "@/components/ui/sidebar";

/** Toggles the sidebar whenever main relays the sidebar shortcut; call inside a `SidebarProvider`. */
export function useSidebarToggleSync() {
  const { toggleSidebar } = useSidebar();

  useEffect(() => window.api.onToggleSidebar(toggleSidebar), [toggleSidebar]);
}
