import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTabsChangedSync } from "@/hooks/tabs/use-tabs-changed-sync";
import { useViewBounds } from "@/hooks/tabs/use-view-bounds";

import { SidebarBody } from "./sidebar-body";
import { SidebarToggleListener } from "./sidebar-toggle-listener";

export function BrowserShell() {
  useTabsChangedSync();
  const viewBoundsRef = useViewBounds();

  return (
    <SidebarProvider>
      <SidebarToggleListener />
      <Sidebar variant="inset">
        <SidebarBody trigger={<SidebarTrigger />} />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-1 rounded-xl border">
          <div ref={viewBoundsRef} className="flex-1" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
