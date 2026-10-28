import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { SampleTab } from "./constants/sample-tabs";

type TabListProps = {
  tabs: SampleTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
};

export function TabList({ tabs, activeTabId, onSelectTab }: TabListProps) {
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
              {tab.title}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
