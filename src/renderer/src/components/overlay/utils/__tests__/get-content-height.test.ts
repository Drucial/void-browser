import { describe, expect, it } from "vitest";

import { getContentHeight } from "@/components/overlay/utils/get-content-height";

describe("getContentHeight", () => {
  it("is zero with nothing to show", () => {
    expect(getContentHeight([], 16)).toBe(0);
  });

  it("reaches the lowest bottom, rounded up, plus padding", () => {
    expect(getContentHeight([68.7, 120.1], 16)).toBe(137);
  });
});
