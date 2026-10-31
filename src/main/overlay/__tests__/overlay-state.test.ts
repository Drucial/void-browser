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

  it("covers the left panel and its shadow room while peeking and keeps it through the slide-out", () => {
    const state = createReadyState();
    state.setSidebarOpen(false);
    state.showPeek();

    const panel = { x: 0, y: 8, width: 288, height: 692 };
    expect(state.getBounds()).toEqual(panel);

    state.hidePeek();

    expect(state.getBounds()).toEqual(panel);

    state.finishPeekExit();

    expect(state.getBounds()).toBeNull();
  });

  it("ignores peek requests while the sidebar is open and hides an open peek when it opens", () => {
    const state = createReadyState();
    state.showPeek();

    expect(state.getPeekPhase()).toBe("off");

    state.setSidebarOpen(false);
    state.showPeek();
    state.setSidebarOpen(true);

    expect(state.getPeekPhase()).toBe("closing");
  });

  it("covers both the panel and the toast with their union", () => {
    const state = createReadyState();
    state.setSidebarOpen(false);
    state.showPeek();
    state.reportContentHeight(90);

    expect(state.getBounds()).toEqual({
      x: 0,
      y: 8,
      width: 1000,
      height: 692,
    });
  });

  it("ends the peek when a modal opens and refuses a peek while it is open", () => {
    const state = createReadyState();
    state.setSidebarOpen(false);
    state.showPeek();
    state.openModal();

    expect(state.getPeekPhase()).toBe("off");
    expect(state.getBounds()).toEqual({ x: 0, y: 0, ...WINDOW });

    state.showPeek();
    state.closeModal();

    expect(state.getBounds()).toBeNull();
  });
});
