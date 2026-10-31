import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createPeekHover,
  EXIT_SETTLE_MS,
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

  it("shows at once on an exit and stays open while the pointer never returns", () => {
    const { hover, onShow, onHide } = createHover();
    hover.exitedLeft();
    vi.advanceTimersByTime(60_000);

    expect(onShow).toHaveBeenCalledOnce();
    expect(onHide).not.toHaveBeenCalled();
  });

  it("is not ended by gutter or panel reports that trail an exit", () => {
    const { hover, onShow, onHide } = createHover();
    hover.exitedLeft();
    hover.setInside("gutter", true);
    hover.setInside("gutter", false);
    hover.setInside("panel", true);
    hover.setInside("panel", false);
    hover.pointerReturned();
    vi.advanceTimersByTime(60_000);

    expect(onShow).toHaveBeenCalledOnce();
    expect(onHide).not.toHaveBeenCalled();
  });

  it("hides the leave delay after the pointer returns elsewhere in the window", () => {
    const { hover, onHide } = createHover();
    hover.exitedLeft();
    vi.advanceTimersByTime(EXIT_SETTLE_MS);
    hover.pointerReturned();
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS - 1);

    expect(onHide).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onHide).toHaveBeenCalledOnce();
  });

  it("keeps the nav when a pointer return is followed by a panel enter", () => {
    const { hover, onHide } = createHover();
    hover.exitedLeft();
    vi.advanceTimersByTime(EXIT_SETTLE_MS);
    hover.pointerReturned();
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS - 1);
    hover.setInside("panel", true);
    vi.advanceTimersByTime(60_000);

    expect(onHide).not.toHaveBeenCalled();
  });

  it("applies the normal rules once the pointer enters the panel after an exit", () => {
    const { hover, onHide } = createHover();
    hover.exitedLeft();
    vi.advanceTimersByTime(EXIT_SETTLE_MS);
    hover.setInside("panel", true);
    vi.advanceTimersByTime(60_000);

    expect(onHide).not.toHaveBeenCalled();

    hover.setInside("panel", false);
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onHide).toHaveBeenCalledOnce();
  });

  it("ends the hold on reset", () => {
    const { hover, onHide } = createHover();
    hover.exitedLeft();
    hover.reset();
    vi.advanceTimersByTime(EXIT_SETTLE_MS);
    hover.pointerReturned();
    vi.advanceTimersByTime(HOVER_HIDE_DELAY_MS);

    expect(onHide).not.toHaveBeenCalled();
  });

  it("ignores an exit report while the pointer is on the panel", () => {
    const { hover, onShow } = createHover();
    hover.setInside("panel", true);
    hover.exitedLeft();

    expect(onShow).not.toHaveBeenCalled();
  });
});

describe("peek hover while a button is held", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not show when the show timer fires with a button held, and shows a hold after release", () => {
    const { hover, onShow } = createHover();
    hover.setInside("gutter", true);
    hover.setPressed(true);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS * 2);

    expect(onShow).not.toHaveBeenCalled();

    hover.setPressed(false);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS - 1);

    expect(onShow).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onShow).toHaveBeenCalledOnce();
  });

  it("does not restart a deferred show after the pointer left the gutter", () => {
    const { hover, onShow } = createHover();
    hover.setInside("gutter", true);
    hover.setPressed(true);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS);
    hover.setInside("gutter", false);
    hover.setPressed(false);
    vi.advanceTimersByTime(HOVER_SHOW_DELAY_MS * 2);

    expect(onShow).not.toHaveBeenCalled();
  });

  it("ignores an exit while a button is held", () => {
    const { hover, onShow } = createHover();
    hover.setPressed(true);
    hover.exitedLeft();

    expect(onShow).not.toHaveBeenCalled();
  });
});
