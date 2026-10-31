import { useQuery } from "@tanstack/react-query";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { tabQueries } from "@/hooks/tabs/tabs.queries";
import { useTabActions } from "@/hooks/tabs/use-tab-actions";
import { useTabsChangedSync } from "@/hooks/tabs/use-tabs-changed-sync";
import { useViewBounds } from "@/hooks/tabs/use-view-bounds";
import { getSiteLabel } from "@/utils/get-site-label";

import { TabList } from "./tab-list";

export function BrowserShell() {
  useTabsChangedSync();
  const { data } = useQuery(tabQueries.all());
  const { createTab, closeTab, activateTab } = useTabActions();
  const viewBoundsRef = useViewBounds();

  const tabs = data?.tabs ?? [];
  const activeId = data?.activeId ?? null;
  const activeTab = tabs.find((tab) => tab.id === activeId);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                aria-label="Address bar"
                variant="outline"
                onClick={() => window.api.openPalette()}
              >
                <span>
                  {activeTab
                    ? getSiteLabel(activeTab.url)
                    : "Search or enter an address"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <TabList
            activeTabId={activeId}
            tabs={tabs}
            onCloseTab={closeTab.mutate}
            onCreateTab={() => createTab.mutate()}
            onSelectTab={activateTab.mutate}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 p-2">
          <SidebarTrigger />
        </header>
        <div ref={viewBoundsRef} className="bg-background flex-1" />
      </SidebarInset>
    </SidebarProvider>
  );
}
