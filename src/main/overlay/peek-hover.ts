import type { PeekZone } from "../../shared/ipc";

export const HOVER_SHOW_DELAY_MS = 100;
export const HOVER_HIDE_DELAY_MS = 300;
export const EXIT_IDLE_HIDE_MS = 1500; // the pointer is outside the window, so no leave will ever report

type PeekHoverHandlers = {
  onShow: () => void;
  onHide: () => void;
};

/** Turns pointer enter/leave reports from the edge gutter and the panel into debounced show and hide requests. */
export function createPeekHover({ onShow, onHide }: PeekHoverHandlers) {
  const zonesInside = new Set<PeekZone>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let isHeldByExit = false;

  return {
    setInside(zone: PeekZone, isInside: boolean) {
      if (isInside) zonesInside.add(zone);
      else zonesInside.delete(zone);

      if (isHeldByExit && zone === "gutter") return;

      isHeldByExit = false;
      clearTimeout(timer);
      timer = isInside
        ? setTimeout(onShow, HOVER_SHOW_DELAY_MS)
        : zonesInside.size === 0
          ? setTimeout(onHide, HOVER_HIDE_DELAY_MS)
          : undefined;
    },

    /** Shows right away for a pointer that left the window across its left edge, then hides after `EXIT_IDLE_HIDE_MS` unless the pointer reaches the panel. */
    exitedLeft() {
      zonesInside.delete("gutter");
      if (zonesInside.has("panel")) return;

      isHeldByExit = true;
      clearTimeout(timer);
      onShow();
      timer = setTimeout(() => {
        isHeldByExit = false;
        onHide();
      }, EXIT_IDLE_HIDE_MS);
    },

    /** Forgets where the pointer is and cancels any pending request. */
    reset() {
      isHeldByExit = false;
      zonesInside.clear();
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
