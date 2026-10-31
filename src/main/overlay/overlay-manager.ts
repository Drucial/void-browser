import { join } from "node:path";

import type { BrowserWindow, WebContents } from "electron";
import { WebContentsView } from "electron";

import type { ToastRequest, ViewBounds } from "../../shared/ipc";
import { createOverlayState } from "./overlay-state";

const TRANSPARENT = "#00000000";
const PEEK_EXIT_TIMEOUT_MS = 400; // hides the view even if the renderer never confirms its 200ms slide-out

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
  let peekExitTimer: ReturnType<typeof setTimeout> | undefined;

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

  function sendPeek(isOpen: boolean) {
    view?.webContents.send("overlay:peek", { isOpen });
  }

  function endPeekExit() {
    clearTimeout(peekExitTimer);
    peekExitTimer = undefined;
    state.finishPeekExit();
    applyBounds();
  }

  function showPeek() {
    state.showPeek();
    if (state.getPeekPhase() !== "open") return;

    clearTimeout(peekExitTimer);
    peekExitTimer = undefined;
    applyBounds();
    sendPeek(true);
  }

  function hidePeek() {
    state.hidePeek();
    if (state.getPeekPhase() !== "closing") return;

    sendPeek(false);
    clearTimeout(peekExitTimer);
    peekExitTimer = setTimeout(endPeekExit, PEEK_EXIT_TIMEOUT_MS);
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
      clearTimeout(peekExitTimer);
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

    /** Slides the floating nav in over the page; does nothing while the sidebar is open or the palette is. */
    showPeek,

    /** Slides the floating nav out, then hides the overlay once the renderer confirms or the exit times out. */
    hidePeek,

    /** Ends the slide-out the renderer was asked for. */
    confirmPeekExit() {
      if (state.getPeekPhase() === "closing") endPeekExit();
    },

    /** Records whether the shell's sidebar is pinned open; opening it hides the floating nav. */
    setSidebarOpen(open: boolean) {
      state.setSidebarOpen(open);
      if (open) hidePeek();
    },

    /** Covers the window with the overlay and shows the command palette prefilled with `query`. */
    openPalette(query: string) {
      const wasPeeking = state.getPeekPhase() !== "off";
      clearTimeout(peekExitTimer);
      peekExitTimer = undefined;
      state.openModal();
      if (wasPeeking) sendPeek(false);
      applyBounds();
      view?.webContents.focus();
      view?.webContents.send("overlay:open", { query });
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
