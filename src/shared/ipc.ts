import type { z } from "zod";

import type { tabs } from "../main/db/schema";
import type { boundsSchema } from "../main/ipc/register-ipc-handlers";

export type Tab = typeof tabs.$inferSelect;

export type TabsSnapshot = {
  tabs: Tab[];
  activeId: number | null;
};

export type ViewBounds = z.infer<typeof boundsSchema>;

export type InvokeContract = {
  "tabs:list": { input: undefined; output: TabsSnapshot };
  "tabs:create": { input: string | undefined; output: void };
  "tabs:close": { input: number; output: void };
  "tabs:activate": { input: number; output: void };
  "tabs:navigate": { input: string; output: void };
};

export type SendContract = {
  "view:set-bounds": ViewBounds;
};

export type AppApi = {
  listTabs: () => Promise<TabsSnapshot>;
  createTab: (url?: string) => Promise<void>;
  closeTab: (id: number) => Promise<void>;
  activateTab: (id: number) => Promise<void>;
  navigateActiveTab: (url: string) => Promise<void>;
  setViewBounds: (bounds: ViewBounds) => void;
  onTabsChanged: (listener: () => void) => () => void;
};
