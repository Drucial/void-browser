import type { WebContents } from "electron";

export const LEFT_EXIT_ZONE_PX = 96; // a fast flick can skip many pixels between the last sample and the exit

/** Feeds `contents` pointer moves and leaves, in window coordinates, to `detector`. */
export function watchLeftExit(
  contents: WebContents,
  detector: LeftExitDetector
) {
  contents.on("before-mouse-event", (_event, mouse) => {
    if (mouse.type === "mouseMove")
      detector.move(mouse.globalX ?? mouse.x, mouse.globalY ?? mouse.y);
    else if (mouse.type === "mouseLeave") detector.leave(mouse.x);
  });
}

export type LeftExitDetector = ReturnType<typeof createLeftExitDetector>;

/** Calls `onExit` when the pointer leaves the window moving left from within the edge zone; the moves of every view in the window feed one history. */
export function createLeftExitDetector(onExit: () => void) {
  let last: { x: number; y: number } | undefined;
  let previous: { x: number; y: number } | undefined;

  return {
    move(x: number, y: number) {
      if (last?.x === x && last.y === y) return;

      previous = last;
      last = { x, y };
    },

    /** `x` is the leaving view's own x; a negative one means the pointer crossed into the gutter, not out of the window. */
    leave(x: number) {
      if (x < 0) return;

      const from = previous;
      const to = last;
      previous = undefined;
      last = undefined;
      if (!from || !to) return;

      const dx = to.x - from.x;
      const isLeftward = dx < 0 && -dx >= Math.abs(to.y - from.y);
      if (isLeftward && to.x <= LEFT_EXIT_ZONE_PX) onExit();
    },
  };
}
