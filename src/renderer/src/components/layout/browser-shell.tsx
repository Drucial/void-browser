import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { SAMPLE_TABS } from "./constants/sample-tabs";
import { TabList } from "./tab-list";

export function BrowserShell() {
  const [activeTabId, setActiveTabId] = useState(SAMPLE_TABS[0]?.id ?? "");
  const activeTab = SAMPLE_TABS.find((tab) => tab.id === activeTabId);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <TabList
            activeTabId={activeTabId}
            tabs={SAMPLE_TABS}
            onSelectTab={setActiveTabId}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="p-2">
          <Input
            key={activeTabId}
            aria-label="Address bar"
            defaultValue={activeTab?.url}
          />
        </header>
        <div className="text-muted-foreground flex flex-1 items-center justify-center">
          {activeTab?.title}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
