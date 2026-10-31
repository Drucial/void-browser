import { describe, expect, it, vi } from "vitest";

import { createLeftExitDetector, LEFT_EXIT_ZONE_PX } from "../left-exit";

function createDetector() {
  const onExit = vi.fn();

  return { onExit, detector: createLeftExitDetector(onExit) };
}

describe("left exit detector", () => {
  it("reports a leftward move that leaves from inside the edge zone", () => {
    const { detector, onExit } = createDetector();
    detector.move(LEFT_EXIT_ZONE_PX + 60, 300);
    detector.move(LEFT_EXIT_ZONE_PX - 10, 300);
    detector.leave(LEFT_EXIT_ZONE_PX - 10);

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores a leave from beyond the edge zone", () => {
    const { detector, onExit } = createDetector();
    detector.move(LEFT_EXIT_ZONE_PX + 200, 300);
    detector.move(LEFT_EXIT_ZONE_PX + 100, 300);
    detector.leave(LEFT_EXIT_ZONE_PX + 100);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores exits through the top or bottom near the left edge", () => {
    const { detector, onExit } = createDetector();
    detector.move(40, 120);
    detector.move(38, 4);
    detector.leave(38);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores a rightward move out of the edge zone", () => {
    const { detector, onExit } = createDetector();
    detector.move(5, 300);
    detector.move(60, 300);
    detector.leave(60);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores a leave into a neighbouring view, reported at a negative position", () => {
    const { detector, onExit } = createDetector();
    detector.move(30, 300);
    detector.move(3, 300);
    detector.leave(-1);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("keeps the moves leading into the gutter across the leave that reports it", () => {
    const { detector, onExit } = createDetector();
    detector.move(70, 300);
    detector.leave(-1);
    detector.move(4, 300);
    detector.leave(4);

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("counts a repeated position once, so duplicate samples do not hide the direction", () => {
    const { detector, onExit } = createDetector();
    detector.move(30, 300);
    detector.move(0, 300);
    detector.move(0, 300);
    detector.leave(0);

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("forgets earlier moves after a leave", () => {
    const { detector, onExit } = createDetector();
    detector.move(40, 300);
    detector.move(10, 300);
    detector.leave(10);
    detector.leave(10);

    expect(onExit).toHaveBeenCalledOnce();
  });
});
