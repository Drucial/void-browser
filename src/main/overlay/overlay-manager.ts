import { join } from "node:path";

import type { BrowserWindow, WebContents } from "electron";
import { WebContentsView } from "electron";

import type { ToastRequest, ViewBounds } from "../../shared/ipc";
import { createOverlayState } from "./overlay-state";

const TRANSPARENT = "#00000000";

export type OverlayManager = ReturnType<typeof createOverlayManager>;

type OverlayDeps = {
  loadPage: (contents: WebContents) => void;
  focusActiveTab: () => void;
};

/** Owns the one transparent topmost view that hosts app UI over tab pages; hidden unless something is showing. */
export function createOverlayManager({
  loadPage,
  focusActiveTab,
}: OverlayDeps) {
  const state = createOverlayState();
  let window: BrowserWindow | null = null;
  let view: WebContentsView | null = null;
  let isShowing = false;

  function applyBounds() {
    if (!view) return;

    const bounds = state.getBounds();
    if (bounds) {
      view.setBounds(bounds);
      view.setVisible(true);
      isShowing = true;

      return;
    }

    if (!isShowing) return;
    isShowing = false;
    const hadFocus = view.webContents.isFocused();
    view.setVisible(false);
    if (hadFocus) focusActiveTab();
  }

  function syncWindowSize() {
    if (!window || window.isDestroyed()) return;

    const [width = 0, height = 0] = window.getContentSize();
    state.setWindowSize({ width, height });
    applyBounds();
  }

  return {
    /** Creates the overlay view on top of `target`, hidden. */
    attach(target: BrowserWindow) {
      window = target;
      view = new WebContentsView({
        webPreferences: {
          preload: join(__dirname, "../preload/overlay.js"),
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: false,
        },
      });
      view.setBackgroundColor(TRANSPARENT);
      view.setVisible(false);
      loadPage(view.webContents);
      target.contentView.addChildView(view);
      target.on("resize", syncWindowSize);
      syncWindowSize();
    },

    /** Closes the overlay view and detaches from the window. */
    dispose() {
      view?.webContents.close();
      view = null;
      window = null;
      isShowing = false;
    },

    /** Moves the overlay above every other view; call after any change to the window's view stack. */
    raise() {
      if (window && view) window.contentView.addChildView(view);
    },

    setPageBounds(bounds: ViewBounds) {
      state.setPageBounds(bounds);
      applyBounds();
    },

    showToast(toast: ToastRequest) {
      state.showToast();
      applyBounds();
      view?.webContents.send("overlay:toast", toast);
    },

    reportContentHeight(height: number) {
      state.reportContentHeight(height);
      applyBounds();
    },

    /** Covers the window with the overlay and gives it keyboard focus. */
    openModal() {
      state.openModal();
      applyBounds();
      view?.webContents.focus();
    },

    /** Uncovers the window and returns focus to the active tab. */
    closeModal() {
      state.closeModal();
      applyBounds();
    },

    notifyThemeChanged() {
      view?.webContents.send("theme:changed");
    },
  };
}
