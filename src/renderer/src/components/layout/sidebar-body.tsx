import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { tabQueries } from "@/hooks/tabs/tabs.queries";
import { useTabActions } from "@/hooks/tabs/use-tab-actions";
import { getSiteLabel } from "@/utils/get-site-label";

import { TabList } from "./tab-list";

/** The address field, tab list and `trigger` control shared by the sidebar and the floating nav; call inside a `SidebarProvider`. */
export function SidebarBody({ trigger }: { trigger: ReactNode }) {
  const { data } = useQuery(tabQueries.all());
  const { createTab, closeTab, activateTab } = useTabActions();

  const tabs = data?.tabs ?? [];
  const activeId = data?.activeId ?? null;
  const activeTab = tabs.find((tab) => tab.id === activeId);

  return (
    <>
      <SidebarHeader className="flex-row items-center">
        <SidebarMenu className="min-w-0 flex-1">
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
        {trigger}
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
    </>
  );
}
