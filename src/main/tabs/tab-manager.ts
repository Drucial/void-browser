import type { BrowserWindow } from "electron";
import { WebContentsView } from "electron";

import type { Tab, TabsSnapshot, ViewBounds } from "../../shared/ipc";
import type { AppDatabase } from "../db/database";
import { recordVisit, setUrlTitle } from "../db/history";
import { closeTab, createTab, listTabs, updateTab } from "../db/tabs";
import { getBackgroundColor } from "../theme/background-color";
import type { ThemeController } from "../theme/theme-controller";
import { pickActiveAfterClose } from "./active-tab";
import { isAllowedUrl, normalizeUrl } from "./normalize-url";

const DEFAULT_TAB_URL = "https://duckduckgo.com/";
const HIDDEN_BOUNDS: ViewBounds = { x: 0, y: 0, width: 0, height: 0 };

export type TabManager = ReturnType<typeof createTabManager>;

/** Owns the tab views, the active tab and tab persistence for one window at a time. */
export function createTabManager(db: AppDatabase, theme: ThemeController) {
  const views = new Map<number, WebContentsView>();
  let window: BrowserWindow | null = null;
  let activeId: number | null = null;
  let bounds: ViewBounds = HIDDEN_BOUNDS;
  const stackListeners = new Set<() => void>();

  theme.onChanged((state) => {
    for (const view of views.values()) {
      view.setBackgroundColor(getBackgroundColor(state.isDark));
    }
  });

  function emitChanged() {
    if (window && !window.isDestroyed()) {
      window.webContents.send("tabs:changed");
    }
  }

  function getSnapshot(): TabsSnapshot {
    return { tabs: listTabs(db), activeId };
  }

  function getActiveView() {
    return activeId === null ? undefined : views.get(activeId);
  }

  function showActiveView() {
    if (!window) return;

    for (const [id, view] of views) {
      if (id !== activeId) window.contentView.removeChildView(view);
    }

    const active = getActiveView();
    if (!active) return;

    window.contentView.addChildView(active);
    active.setBounds(bounds);
    stackListeners.forEach((listener) => listener());
  }

  function loadUrl(view: WebContentsView, url: string) {
    view.webContents.loadURL(url).catch(() => undefined);
  }

  function trackNavigation(tab: Tab, view: WebContentsView) {
    const { webContents } = view;

    const blockDisallowedNavigation = (
      event: { preventDefault: () => void },
      url: string
    ) => {
      if (!isAllowedUrl(url)) event.preventDefault();
    };

    webContents.on("will-navigate", blockDisallowedNavigation);
    webContents.on("will-redirect", blockDisallowedNavigation);

    webContents.on("did-navigate", (_event, url) => {
      if (isAllowedUrl(url)) {
        updateTab(db, tab.id, { url });
        recordVisit(db, {
          url,
          title: webContents.getTitle(),
          visitedAt: Date.now(),
        });
      }
      emitChanged();
    });

    webContents.on("did-navigate-in-page", (_event, url, isMainFrame) => {
      if (!isMainFrame) return;
      updateTab(db, tab.id, { url });
      emitChanged();
    });

    webContents.on("page-title-updated", (_event, title) => {
      updateTab(db, tab.id, { title });
      const url = webContents.getURL();
      if (isAllowedUrl(url)) setUrlTitle(db, url, title);
      emitChanged();
    });

    webContents.setWindowOpenHandler(({ url }) => {
      const target = normalizeUrl(url);
      if (target) open(target);

      return { action: "deny" };
    });
  }

  function attachView(tab: Tab) {
    const view = new WebContentsView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    view.setBackgroundColor(getBackgroundColor(theme.getState().isDark));
    views.set(tab.id, view);
    trackNavigation(tab, view);
    const url = normalizeUrl(tab.url);
    if (url) loadUrl(view, url);
  }

  function open(url: string) {
    const tab = createTab(db, { url });
    attachView(tab);
    activeId = tab.id;
    showActiveView();
    emitChanged();
  }

  function destroyView(id: number) {
    const view = views.get(id);
    if (!view) return;

    window?.contentView.removeChildView(view);
    view.webContents.close();
    views.delete(id);
  }

  return {
    getSnapshot,

    /** Runs `listener` after the active tab view is stacked into the window; returns an unsubscribe. */
    onStackChanged(listener: () => void) {
      stackListeners.add(listener);

      return () => stackListeners.delete(listener);
    },

    /** Moves keyboard focus to the active tab's page. */
    focusActive() {
      getActiveView()?.webContents.focus();
    },

    /** Loads the persisted tabs into `target`, creating a first tab if there are none, and activates the first. */
    restore(target: BrowserWindow) {
      window = target;
      const tabs = listTabs(db);

      if (tabs.length === 0) {
        open(DEFAULT_TAB_URL);

        return;
      }

      tabs.forEach(attachView);
      activeId = tabs[0]?.id ?? null;
      showActiveView();
      emitChanged();
    },

    /** Closes every view and detaches from the window; persisted tabs stay. */
    dispose() {
      const closing = window;
      window = null;
      for (const view of views.values()) {
        if (closing && !closing.isDestroyed()) {
          closing.contentView.removeChildView(view);
        }
        view.webContents.close();
      }
      views.clear();
      activeId = null;
    },

    /** Opens `url` in a new active tab, or the default page when omitted. */
    create(url: string = DEFAULT_TAB_URL) {
      open(url);
    },

    close(id: number) {
      if (!views.has(id)) return;

      const nextActiveId = pickActiveAfterClose(
        listTabs(db).map((tab) => tab.id),
        id,
        activeId
      );

      destroyView(id);
      closeTab(db, id);
      activeId = nextActiveId;

      if (activeId === null) {
        open(DEFAULT_TAB_URL);

        return;
      }

      showActiveView();
      emitChanged();
    },

    activate(id: number) {
      if (!views.has(id)) return;

      activeId = id;
      showActiveView();
      emitChanged();
    },

    navigateActive(url: string) {
      const view = getActiveView();
      if (view) loadUrl(view, url);
    },

    setBounds(next: ViewBounds) {
      bounds = next;
      const view = getActiveView();
      view?.setBounds(bounds);
    },
  };
}
