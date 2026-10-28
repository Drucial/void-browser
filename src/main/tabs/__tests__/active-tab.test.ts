import { describe, expect, it } from "vitest";

import { pickActiveAfterClose } from "../active-tab";

describe("pickActiveAfterClose", () => {
  it("keeps the active tab when another tab closes", () => {
    expect(pickActiveAfterClose([1, 2, 3], 1, 3)).toBe(3);
  });

  it("moves to the tab that takes the closed position", () => {
    expect(pickActiveAfterClose([1, 2, 3], 2, 2)).toBe(3);
  });

  it("falls back to the previous tab when the last one closes", () => {
    expect(pickActiveAfterClose([1, 2, 3], 3, 3)).toBe(2);
  });

  it("returns null when no tabs remain", () => {
    expect(pickActiveAfterClose([1], 1, 1)).toBeNull();
  });
});
