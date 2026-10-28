import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { tabQueries } from "@/hooks/tabs/tabs.queries";
import { useTabActions } from "@/hooks/tabs/use-tab-actions";
import { useTabsChangedSync } from "@/hooks/tabs/use-tabs-changed-sync";
import { useViewBounds } from "@/hooks/tabs/use-view-bounds";

import { TabList } from "./tab-list";

export function BrowserShell() {
  useTabsChangedSync();
  const { data } = useQuery(tabQueries.all());
  const { createTab, closeTab, activateTab, navigateActiveTab } =
    useTabActions();
  const viewBoundsRef = useViewBounds();

  const tabs = data?.tabs ?? [];
  const activeId = data?.activeId ?? null;
  const activeTab = tabs.find((tab) => tab.id === activeId);

  return (
    <SidebarProvider>
      <Sidebar>
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
          <form
            className="flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              const address = new FormData(event.currentTarget).get("address");
              if (typeof address === "string")
                navigateActiveTab.mutate(address);
            }}
          >
            <Input
              key={`${activeId}:${activeTab?.url}`}
              aria-label="Address bar"
              defaultValue={activeTab?.url}
              name="address"
            />
          </form>
        </header>
        <div ref={viewBoundsRef} className="bg-background flex-1" />
      </SidebarInset>
    </SidebarProvider>
  );
}
