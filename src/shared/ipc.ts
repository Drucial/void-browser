export type Tab = {
  id: number;
  url: string;
  title: string;
  position: number;
};

export type TabsSnapshot = {
  tabs: Tab[];
  activeId: number | null;
};

export type ViewBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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
