import type { Tab } from "@shared/ipc";
import { PlusIcon, XIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type TabListProps = {
  tabs: Tab[];
  activeTabId: number | null;
  onSelectTab: (tabId: number) => void;
  onCloseTab: (tabId: number) => void;
  onCreateTab: () => void;
};

export function TabList({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCreateTab,
}: TabListProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tabs</SidebarGroupLabel>
      <SidebarMenu>
        {tabs.map((tab) => (
          <SidebarMenuItem key={tab.id}>
            <SidebarMenuButton
              isActive={tab.id === activeTabId}
              onClick={() => onSelectTab(tab.id)}
            >
              {tab.title || tab.url}
            </SidebarMenuButton>
            <SidebarMenuAction
              aria-label={`Close ${tab.title || tab.url}`}
              onClick={() => onCloseTab(tab.id)}
            >
              <XIcon />
            </SidebarMenuAction>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onCreateTab}>
            <PlusIcon />
            New tab
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
