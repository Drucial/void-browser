import type { z } from "zod";

import type { tabs, urls } from "../main/db/schema";
import type { ThemePreference } from "../main/db/settings";
import type {
  boundsSchema,
  contentHeightSchema,
  navigateRequestSchema,
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

export type NavigateRequest = z.input<typeof navigateRequestSchema>;

export type HistorySearchResult = {
  entries: HistoryEntry[];
};

export type PaletteIntent = { query: string };

export type InvokeContract = {
  "tabs:list": { input: undefined; output: TabsSnapshot };
  "tabs:create": { input: string | undefined; output: void };
  "tabs:close": { input: number; output: void };
  "tabs:activate": { input: number; output: void };
  "overlay:navigate": { input: NavigateRequest; output: void };
  "history:search": { input: string; output: HistorySearchResult };
  "theme:get": { input: undefined; output: ThemeState };
  "theme:set": { input: ThemePreference; output: void };
};

export type SendContract = {
  "view:set-bounds": ViewBounds;
  "overlay:toast": ToastRequest;
  "overlay:open-palette": undefined;
  "overlay:close": undefined;
  "overlay:report-content-height": z.infer<typeof contentHeightSchema>;
};

export type AppApi = {
  listTabs: () => Promise<TabsSnapshot>;
  createTab: (url?: string) => Promise<void>;
  closeTab: (id: number) => Promise<void>;
  activateTab: (id: number) => Promise<void>;
  searchHistory: (query: string) => Promise<HistorySearchResult>;
  getTheme: () => Promise<ThemeState>;
  setTheme: (preference: ThemePreference) => Promise<void>;
  setViewBounds: (bounds: ViewBounds) => void;
  showToast: (toast: ToastRequest) => void;
  openPalette: () => void;
  onTabsChanged: (listener: () => void) => () => void;
  onThemeChanged: (listener: () => void) => () => void;
  onToggleSidebar: (listener: () => void) => () => void;
};

export type OverlayDataApi = Pick<
  AppApi,
  "getTheme" | "onThemeChanged" | "searchHistory"
>;

export type OverlayApi = {
  reportContentHeight: (height: number) => void;
  navigate: (request: NavigateRequest) => Promise<void>;
  close: () => void;
  onOpen: (listener: (intent: PaletteIntent) => void) => () => void;
  onToast: (listener: (toast: ToastRequest) => void) => () => void;
};
