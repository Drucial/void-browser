import { cn } from "cn";
import { PanelLeftIcon } from "lucide-react";

import { SidebarBody } from "@/components/layout/sidebar-body";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePeekSession } from "@/hooks/overlay/use-peek-session";
import { useTabsChangedSync } from "@/hooks/tabs/use-tabs-changed-sync";

export function PeekHost() {
  useTabsChangedSync();
  const { isOpen, reportHover, confirmExit } = usePeekSession();

  return (
    <nav
      aria-label="Tabs"
      inert={!isOpen}
      className={cn(
        "bg-background fixed top-0 left-0 h-full w-64 overflow-hidden rounded-xl border transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      onPointerEnter={() => reportHover(true)}
      onPointerLeave={() => reportHover(false)}
      onTransitionEnd={confirmExit}
    >
      <SidebarProvider>
        <div className="flex h-svh min-w-0 flex-1 flex-col">
          <SidebarBody
            trigger={
              <Button
                aria-label="Pin sidebar"
                size="icon-sm"
                variant="ghost"
                onClick={() => window.overlayApi.toggleSidebar()}
              >
                <PanelLeftIcon />
              </Button>
            }
          />
        </div>
      </SidebarProvider>
    </nav>
  );
}
