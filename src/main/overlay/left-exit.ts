import type { WebContents } from "electron";

export const LEFT_EXIT_ZONE_PX = 32; // the pointer outruns its own samples, so a flick ends a few pixels short of the edge
export const LEFT_EXIT_MIN_SPEED_PX_PER_MS = 1; // slower than a flick is a deliberate approach, not an exit
export const LEFT_EXIT_EDGE_BAND_PX = 12; // a decelerating exit slows to a crawl at the edge, so any leftward move ending this close counts
export const LEFT_EXIT_IDLE_MS = 80; // the page view reports no leave on a fast exit, so silence after a flick is the signal

/** Feeds `contents` pointer moves, in window coordinates, to `detector`. */
export function watchLeftExit(
  contents: WebContents,
  detector: LeftExitDetector
) {
  contents.on("before-mouse-event", (_event, mouse) => {
    if (mouse.type === "mouseMove")
      detector.move(mouse.globalX ?? mouse.x, mouse.globalY ?? mouse.y);
  });
}

export type LeftExitDetector = ReturnType<typeof createLeftExitDetector>;

/** Calls `onExit` when a leftward move ends at the edge (fast within the zone or one step of the edge, any speed within the band) and no pointer event follows; the moves of every view in the window feed one history. */
export function createLeftExitDetector(onExit: () => void) {
  let last: { x: number; y: number; at: number } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function isLeftwardToEdge(
    from: { x: number; y: number; at: number },
    to: { x: number; y: number; at: number }
  ) {
    const dx = to.x - from.x;
    const isLeftward = dx < 0 && -dx >= Math.abs(to.y - from.y);
    const speed = -dx / Math.max(to.at - from.at, 1);

    return (
      isLeftward &&
      (to.x <= LEFT_EXIT_EDGE_BAND_PX ||
        (speed >= LEFT_EXIT_MIN_SPEED_PX_PER_MS &&
          to.x <= Math.max(LEFT_EXIT_ZONE_PX, -dx)))
    );
  }

  return {
    move(x: number, y: number) {
      if (last?.x === x && last.y === y) return;

      const from = last;
      const to = { x, y, at: Date.now() };
      last = to;
      clearTimeout(timer);
      if (!from || !isLeftwardToEdge(from, to)) return;

      timer = setTimeout(() => {
        last = undefined;
        onExit();
      }, LEFT_EXIT_IDLE_MS);
    },
  };
}
