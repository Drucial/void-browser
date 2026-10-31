import type { PeekZone } from "../../shared/ipc";

export const HOVER_SHOW_DELAY_MS = 100;
export const HOVER_HIDE_DELAY_MS = 300;

type PeekHoverHandlers = {
  onShow: () => void;
  onHide: () => void;
};

/** Turns pointer enter/leave reports from the edge gutter and the panel into debounced show and hide requests. */
export function createPeekHover({ onShow, onHide }: PeekHoverHandlers) {
  const zonesInside = new Set<PeekZone>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  return {
    setInside(zone: PeekZone, isInside: boolean) {
      if (isInside) zonesInside.add(zone);
      else zonesInside.delete(zone);

      clearTimeout(timer);
      timer = isInside
        ? setTimeout(onShow, HOVER_SHOW_DELAY_MS)
        : zonesInside.size === 0
          ? setTimeout(onHide, HOVER_HIDE_DELAY_MS)
          : undefined;
    },

    /** Forgets where the pointer is and cancels any pending request. */
    reset() {
      zonesInside.clear();
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
