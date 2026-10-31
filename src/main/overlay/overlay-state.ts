import type { ViewBounds } from "../../shared/ipc";

const TOAST_WIDTH = 380; // the overlay renderer lays toasts out to fill this width, so only the height is reported
const PROVISIONAL_TOAST_HEIGHT = 120; // covers the first toast until the overlay renderer reports its real height
const PEEK_WIDTH = 256; // matches the 16rem sidebar the peek panel mirrors
const PEEK_INSET = 8; // matches the window gutter around the page card
const PEEK_SHADOW_MARGIN = 24; // transparent room right of the panel for its shadow-xl, which the view would otherwise clip

type PeekPhase = "off" | "open" | "closing";

function getUnion(a: ViewBounds, b: ViewBounds): ViewBounds {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);

  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

export type OverlayState = ReturnType<typeof createOverlayState>;

/** Tracks what the overlay shows and derives the bounds main applies to its view; null means hidden. */
export function createOverlayState() {
  let toastHeight = 0;
  let isModalOpen = false;
  let isSidebarOpen = true;
  let peekPhase: PeekPhase = "off";
  let pageBounds: ViewBounds = { x: 0, y: 0, width: 0, height: 0 };
  let windowSize = { width: 0, height: 0 };

  function getToastBounds(): ViewBounds | null {
    if (toastHeight === 0) return null;

    const width = Math.min(TOAST_WIDTH, pageBounds.width);
    const height = Math.min(toastHeight, pageBounds.height);

    return {
      x: pageBounds.x + pageBounds.width - width,
      y: pageBounds.y,
      width,
      height,
    };
  }

  function getPeekBounds(): ViewBounds | null {
    if (peekPhase === "off") return null;

    return {
      x: 0,
      y: PEEK_INSET,
      width: PEEK_INSET + PEEK_WIDTH + PEEK_SHADOW_MARGIN,
      height: Math.max(windowSize.height - PEEK_INSET, 0),
    };
  }

  function getBounds(): ViewBounds | null {
    if (isModalOpen) return { x: 0, y: 0, ...windowSize };

    const toast = getToastBounds();
    const peek = getPeekBounds();
    if (toast && peek) return getUnion(toast, peek);

    return toast ?? peek;
  }

  return {
    getBounds,

    getPeekPhase: () => peekPhase,

    showPeek() {
      if (isSidebarOpen || isModalOpen) return;
      peekPhase = "open";
    },

    hidePeek() {
      if (peekPhase === "open") peekPhase = "closing";
    },

    finishPeekExit() {
      if (peekPhase === "closing") peekPhase = "off";
    },

    setSidebarOpen(open: boolean) {
      isSidebarOpen = open;
      if (open && peekPhase === "open") peekPhase = "closing";
    },

    showToast() {
      if (toastHeight === 0) toastHeight = PROVISIONAL_TOAST_HEIGHT;
    },

    reportContentHeight(height: number) {
      toastHeight = height;
    },

    openModal() {
      isModalOpen = true;
      peekPhase = "off";
    },

    closeModal() {
      isModalOpen = false;
    },

    setPageBounds(next: ViewBounds) {
      pageBounds = next;
    },

    setWindowSize(next: { width: number; height: number }) {
      windowSize = next;
    },
  };
}
