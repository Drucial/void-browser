import type { ViewBounds } from "../../shared/ipc";

const TOAST_WIDTH = 380; // the overlay renderer lays toasts out to fill this width, so only the height is reported
const PROVISIONAL_TOAST_HEIGHT = 120; // covers the first toast until the overlay renderer reports its real height

export type OverlayState = ReturnType<typeof createOverlayState>;

/** Tracks what the overlay shows and derives the bounds main applies to its view; null means hidden. */
export function createOverlayState() {
  let toastHeight = 0;
  let isModalOpen = false;
  let pageBounds: ViewBounds = { x: 0, y: 0, width: 0, height: 0 };
  let windowSize = { width: 0, height: 0 };

  function getBounds(): ViewBounds | null {
    if (isModalOpen) return { x: 0, y: 0, ...windowSize };
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

  return {
    getBounds,

    showToast() {
      if (toastHeight === 0) toastHeight = PROVISIONAL_TOAST_HEIGHT;
    },

    reportContentHeight(height: number) {
      toastHeight = height;
    },

    openModal() {
      isModalOpen = true;
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
