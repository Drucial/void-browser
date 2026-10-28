import type { z } from "zod";

import type { tabs, urls } from "../main/db/schema";
import type { ThemePreference } from "../main/db/settings";
import type {
  boundsSchema,
  contentHeightSchema,
  toastSchema,
} from "../main/ipc/register-ipc-handlers";

export type Tab = typeof tabs.$inferSelect;

export type HistoryEntry = Pick<
  typeof urls.$inferSelect,
  "id" | "url" | "title"
>;

export type TabsSnapshot = {
  tabs: Tab[];
  activeId: number | null;
};

export type ThemeState = {
  preference: ThemePreference;
  isDark: boolean;
};

export type { ThemePreference };

export type ViewBounds = z.infer<typeof boundsSchema>;

export type ToastRequest = z.infer<typeof toastSchema>;

export type InvokeContract = {
  "tabs:list": { input: undefined; output: TabsSnapshot };
  "tabs:create": { input: string | undefined; output: void };
  "tabs:close": { input: number; output: void };
  "tabs:activate": { input: number; output: void };
  "tabs:navigate": { input: string; output: void };
  "history:search": { input: string; output: HistoryEntry[] };
  "theme:get": { input: undefined; output: ThemeState };
  "theme:set": { input: ThemePreference; output: void };
};

export type SendContract = {
  "view:set-bounds": ViewBounds;
  "overlay:toast": ToastRequest;
  "overlay:report-content-height": z.infer<typeof contentHeightSchema>;
};

export type AppApi = {
  listTabs: () => Promise<TabsSnapshot>;
  createTab: (url?: string) => Promise<void>;
  closeTab: (id: number) => Promise<void>;
  activateTab: (id: number) => Promise<void>;
  navigateActiveTab: (url: string) => Promise<void>;
  searchHistory: (query: string) => Promise<HistoryEntry[]>;
  getTheme: () => Promise<ThemeState>;
  setTheme: (preference: ThemePreference) => Promise<void>;
  setViewBounds: (bounds: ViewBounds) => void;
  showToast: (toast: ToastRequest) => void;
  onTabsChanged: (listener: () => void) => () => void;
  onThemeChanged: (listener: () => void) => () => void;
};

export type ThemeApi = Pick<AppApi, "getTheme" | "onThemeChanged">;

export type OverlayApi = {
  reportContentHeight: (height: number) => void;
  onToast: (listener: (toast: ToastRequest) => void) => () => void;
};
