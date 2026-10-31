import type { PeekZone } from "../../shared/ipc";

export const HOVER_SHOW_DELAY_MS = 280;
export const HOVER_HIDE_DELAY_MS = 120;
export const EXIT_SETTLE_MS = 50; // the overlay reports a stray panel enter and leave within ~6ms of an exit show, before the pointer has moved

type PeekHoverHandlers = {
  onShow: () => void;
  onHide: () => void;
};

/** Turns pointer enter/leave reports from the edge gutter and the panel into debounced show and hide requests. */
export function createPeekHover({ onShow, onHide }: PeekHoverHandlers) {
  const zonesInside = new Set<PeekZone>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let isHeldByExit = false;
  let isSettling = false;
  let isPressed = false;
  let isShowDeferred = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  function startShowTimer() {
    return setTimeout(() => {
      if (isPressed) isShowDeferred = true;
      else onShow();
    }, HOVER_SHOW_DELAY_MS);
  }

  return {
    setInside(zone: PeekZone, isInside: boolean) {
      if (isInside) zonesInside.add(zone);
      else zonesInside.delete(zone);

      if (isHeldByExit && !(isInside && zone === "panel" && !isSettling))
        return;

      isHeldByExit = false;
      isShowDeferred = false;
      clearTimeout(timer);
      timer = isInside
        ? startShowTimer()
        : zonesInside.size === 0
          ? setTimeout(onHide, HOVER_HIDE_DELAY_MS)
          : undefined;
    },

    /** Shows right away for a pointer that left the window across its left edge and keeps the nav up until the pointer returns; hover reports before then are ignored, apart from a panel enter. */
    exitedLeft() {
      zonesInside.delete("gutter");
      if (zonesInside.has("panel") || isPressed) return;

      isHeldByExit = true;
      isSettling = true;
      clearTimeout(timer);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        isSettling = false;
      }, EXIT_SETTLE_MS);
      onShow();
    },

    /** Ends the exit hold on the first pointer move back into the window, hiding after the leave delay unless the pointer is on the panel. */
    pointerReturned() {
      if (!isHeldByExit || isSettling) return;

      isHeldByExit = false;
      if (!zonesInside.has("panel"))
        timer = setTimeout(onHide, HOVER_HIDE_DELAY_MS);
    },

    /** Holds back reveals while a mouse button is down, so drags and selections never open the nav; a reveal that came due meanwhile restarts on release. */
    setPressed(nextIsPressed: boolean) {
      isPressed = nextIsPressed;
      if (isPressed || !isShowDeferred) return;

      isShowDeferred = false;
      if (zonesInside.has("gutter")) timer = startShowTimer();
    },

    /** Forgets where the pointer is and cancels any pending request. */
    reset() {
      isHeldByExit = false;
      isSettling = false;
      isShowDeferred = false;
      zonesInside.clear();
      clearTimeout(settleTimer);
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
