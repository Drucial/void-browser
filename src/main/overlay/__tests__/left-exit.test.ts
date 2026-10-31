import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createLeftExitDetector,
  LEFT_EXIT_IDLE_MS,
  LEFT_EXIT_ZONE_PX,
} from "../left-exit";

function createDetector() {
  const onExit = vi.fn();

  return { onExit, detector: createLeftExitDetector(onExit) };
}

describe("left exit detector", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reports a sparse fast flick that ends in the edge zone and goes quiet", () => {
    const { detector, onExit } = createDetector();
    detector.move(400, 300);
    vi.advanceTimersByTime(8);
    detector.move(LEFT_EXIT_ZONE_PX - 10, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS - 1);

    expect(onExit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores a slow approach that pauses in the edge zone", () => {
    const { detector, onExit } = createDetector();
    detector.move(LEFT_EXIT_ZONE_PX + 20, 300);
    vi.advanceTimersByTime(100);
    detector.move(LEFT_EXIT_ZONE_PX - 5, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores a flick that stops outside the edge zone", () => {
    const { detector, onExit } = createDetector();
    detector.move(600, 300);
    vi.advanceTimersByTime(8);
    detector.move(LEFT_EXIT_ZONE_PX + 100, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores a flick out through the top or bottom near the left edge", () => {
    const { detector, onExit } = createDetector();
    detector.move(30, 300);
    vi.advanceTimersByTime(4);
    detector.move(28, 4);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores a fast rightward move", () => {
    const { detector, onExit } = createDetector();
    detector.move(2, 300);
    vi.advanceTimersByTime(4);
    detector.move(300, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("cancels the exit when the pointer moves again before the idle window ends", () => {
    const { detector, onExit } = createDetector();
    detector.move(400, 300);
    vi.advanceTimersByTime(8);
    detector.move(10, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS - 1);
    detector.move(60, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("forgets the flick after reporting it", () => {
    const { detector, onExit } = createDetector();
    detector.move(400, 300);
    vi.advanceTimersByTime(8);
    detector.move(10, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS);
    detector.move(5, 300);
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).toHaveBeenCalledOnce();
  });
});
