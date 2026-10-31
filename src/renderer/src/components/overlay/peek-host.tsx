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
    <div
      className="fixed inset-0"
      onPointerEnter={() => isOpen && reportHover(true)}
      onPointerLeave={() => isOpen && reportHover(false)}
    >
      <nav
        aria-label="Tabs"
        inert={!isOpen}
        className={cn(
          "bg-background transition-peek fixed top-0 bottom-2 left-2 w-64 overflow-hidden rounded-xl border shadow-xl",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-80 opacity-0"
        )}
        onTransitionEnd={confirmExit}
      >
        <SidebarProvider className="h-full min-h-0">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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
    </div>
  );
}
