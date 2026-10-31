import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createLeftExitDetector,
  LEFT_EXIT_EDGE_BAND_PX,
  LEFT_EXIT_IDLE_MS,
  LEFT_EXIT_ZONE_PX,
} from "../left-exit";

const MOUSE_SAMPLE_MS = 7;

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

  it("reports a slow decelerating exit that ends in the edge band", () => {
    const { detector, onExit } = createDetector();
    for (const x of [60.9, 58.3, 53.8, 51.2, 49.4, 44.9, 20, 11.3, 8.8, 5.5]) {
      detector.move(x, 345);
      vi.advanceTimersByTime(MOUSE_SAMPLE_MS);
    }
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS);

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores a slow approach that pauses in the edge zone outside the band", () => {
    const { detector, onExit } = createDetector();
    for (const x of [44.9, 42.3, 36, 30, 26, 22, 20]) {
      detector.move(x, 345);
      vi.advanceTimersByTime(MOUSE_SAMPLE_MS);
    }
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(LEFT_EXIT_EDGE_BAND_PX).toBeLessThan(20);
    expect(onExit).not.toHaveBeenCalled();
  });

  it("reports a very fast flick whose last sample is a step short of the edge", () => {
    const { detector, onExit } = createDetector();
    for (const x of [192.6, 168.3, 128.7, 85.1, 34.1]) {
      detector.move(x, 550);
      vi.advanceTimersByTime(MOUSE_SAMPLE_MS);
    }
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS);

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores a decelerating move that stops outside the zone", () => {
    const { detector, onExit } = createDetector();
    for (const x of [194.3, 145.1, 106.5, 78.7, 58.9, 46.6]) {
      detector.move(x, 400);
      vi.advanceTimersByTime(MOUSE_SAMPLE_MS);
    }
    vi.advanceTimersByTime(LEFT_EXIT_IDLE_MS * 5);

    expect(onExit).not.toHaveBeenCalled();
  });

  it("ignores a flick that stops outside the edge zone", () => {
    const { detector, onExit } = createDetector();
    detector.move(LEFT_EXIT_ZONE_PX + 150, 300);
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
