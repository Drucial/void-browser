import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createPeekHover,
  EXIT_IDLE_HIDE_MS,
  HOVER_HIDE_DELAY_MS,
  HOVER_SHOW_DELAY_MS,
} from "../peek-hover";

function createHover() {
  const onShow = vi.fn();
  const onHide = vi.fn();

  return { onShow, onHide, hover: createPeekHover({ onShow, onHide }) };
}

describe("peek hover", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows after the pointer rests in the gutter, not before", () => {
    const { hover, onShow } = createHover();
    hover.setInside("gutter", true);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS - 1);

    expect(onShow).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onShow).toHaveBeenCalledOnce();
  });

  it("does not show when the pointer leaves the gutter before the delay", () => {
    const { hover, onShow } = createHover();
    hover.setInside("gutter", true);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS - 1);
    hover.setInside("gutter", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onShow).not.toHaveBeenCalled();
  });

  it("hides once the pointer has left both the gutter and the panel for the hide delay", () => {
    const { hover, onHide } = createHover();
    hover.setInside("gutter", true);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS);
    hover.setInside("panel", true);
    hover.setInside("gutter", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onHide).not.toHaveBeenCalled();

    hover.setInside("panel", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS - 1);

    expect(onHide).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onHide).toHaveBeenCalledOnce();
  });

  it("keeps the nav when the pointer moves from the gutter into the panel in time", () => {
    const { hover, onHide } = createHover();
    hover.setInside("gutter", true);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS);
    hover.setInside("gutter", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS - 1);
    hover.setInside("panel", true);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS * 2);

    expect(onHide).not.toHaveBeenCalled();
  });

  it("drops pending requests on reset", () => {
    const { hover, onShow, onHide } = createHover();
    hover.setInside("gutter", true);
    hover.reset();
    hover.setInside("panel", false);
    hover.reset();
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onShow).not.toHaveBeenCalled();
    expect(onHide).not.toHaveBeenCalled();
  });

  it("shows at once when the pointer exits left, then hides if it never returns", () => {
    const { hover, onShow, onHide } = createHover();
    hover.exitedLeft();

    expect(onShow).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(EXIT_IDLE_HIDE_MS - 1);

    expect(onHide).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onHide).toHaveBeenCalledOnce();
  });

  it("keeps the exit-opened nav while the pointer rests on the panel, then hides after it leaves", () => {
    const { hover, onHide } = createHover();
    hover.exitedLeft();
    hover.setInside("panel", true);
    vi.advanceTimersByTime(EXIT_IDLE_HIDE_MS * 2);

    expect(onHide).not.toHaveBeenCalled();

    hover.setInside("panel", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onHide).toHaveBeenCalledOnce();
  });

  it("is not cut short by gutter reports that trail an exit", () => {
    const { hover, onShow, onHide } = createHover();
    hover.exitedLeft();
    hover.setInside("gutter", true);
    hover.setInside("gutter", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onShow).toHaveBeenCalledOnce();
    expect(onHide).not.toHaveBeenCalled();
  });

  it("ignores an exit report while the pointer is on the panel", () => {
    const { hover, onShow } = createHover();
    hover.setInside("panel", true);
    hover.exitedLeft();

    expect(onShow).not.toHaveBeenCalled();
  });
});
