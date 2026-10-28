import { describe, expect, it } from "vitest";

import { createOverlayState } from "../overlay-state";

const PAGE = { x: 200, y: 50, width: 800, height: 650 };
const WINDOW = { width: 1000, height: 700 };

function createReadyState() {
  const state = createOverlayState();
  state.setPageBounds(PAGE);
  state.setWindowSize(WINDOW);

  return state;
}

describe("overlay state", () => {
  it("is hidden until a toast is shown", () => {
    expect(createReadyState().getBounds()).toBeNull();
  });

  it("anchors the reported toast height to the page's top-right corner", () => {
    const state = createReadyState();
    state.showToast();
    state.reportContentHeight(90);

    expect(state.getBounds()).toEqual({
      x: 620,
      y: 50,
      width: 380,
      height: 90,
    });
  });

  it("covers the first toast with a provisional size before one is reported", () => {
    const state = createReadyState();
    state.showToast();

    expect(state.getBounds()).toMatchObject({ x: 620, y: 50 });
  });

  it("hides once the renderer reports no toasts", () => {
    const state = createReadyState();
    state.showToast();
    state.reportContentHeight(90);
    state.reportContentHeight(0);

    expect(state.getBounds()).toBeNull();
  });

  it("keeps the toast inside a page smaller than the toast", () => {
    const state = createReadyState();
    state.setPageBounds({ x: 10, y: 10, width: 300, height: 60 });
    state.reportContentHeight(90);

    expect(state.getBounds()).toEqual({ x: 10, y: 10, width: 300, height: 60 });
  });

  it("goes full-window while a modal is open and returns to the toast after", () => {
    const state = createReadyState();
    state.reportContentHeight(90);
    state.openModal();

    expect(state.getBounds()).toEqual({ x: 0, y: 0, ...WINDOW });

    state.closeModal();

    expect(state.getBounds()).toEqual({
      x: 620,
      y: 50,
      width: 380,
      height: 90,
    });
  });
});
