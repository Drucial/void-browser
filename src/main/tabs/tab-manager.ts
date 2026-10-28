import type { BrowserWindow } from "electron";
import { WebContentsView } from "electron";

import type { Tab, TabsSnapshot, ViewBounds } from "../../shared/ipc";
import type { AppDatabase } from "../db/database";
import { recordVisit } from "../db/history";
import { closeTab, createTab, listTabs, updateTab } from "../db/tabs";
import { pickActiveAfterClose } from "./active-tab";
import { isAllowedUrl, normalizeUrl } from "./normalize-url";

const DEFAULT_TAB_URL = "https://duckduckgo.com/";
const HIDDEN_BOUNDS: ViewBounds = { x: 0, y: 0, width: 0, height: 0 };

export type TabManager = ReturnType<typeof createTabManager>;

/** Owns the tab views, the active tab and tab persistence for one window at a time. */
export function createTabManager(db: AppDatabase) {
  const views = new Map<number, WebContentsView>();
  let window: BrowserWindow | null = null;
  let activeId: number | null = null;
  let bounds: ViewBounds = HIDDEN_BOUNDS;

  function emitChanged() {
    if (window && !window.isDestroyed()) {
      window.webContents.send("tabs:changed");
    }
  }

  function getSnapshot(): TabsSnapshot {
    return { tabs: listTabs(db), activeId };
  }

  function showActiveView() {
    if (!window) return;

    for (const [id, view] of views) {
      if (id !== activeId) window.contentView.removeChildView(view);
    }

    const active = activeId === null ? undefined : views.get(activeId);
    if (!active) return;

    window.contentView.addChildView(active);
    active.setBounds(bounds);
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
      const view = activeId === null ? undefined : views.get(activeId);
      if (view) loadUrl(view, url);
    },

    setBounds(next: ViewBounds) {
      bounds = next;
      const view = activeId === null ? undefined : views.get(activeId);
      view?.setBounds(bounds);
    },
  };
}
