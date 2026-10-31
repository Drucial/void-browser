import { describe, expect, it } from "vitest";

import { getBackgroundColor } from "../background-color";
import { getWindowBackground } from "../window-background";

describe("getWindowBackground", () => {
  it("is transparent and clear on linux", () => {
    expect(getWindowBackground(true, "linux")).toEqual({
      transparent: true,
      backgroundColor: "#00000000",
    });
  });

  it("stays opaque and themed elsewhere", () => {
    expect(getWindowBackground(true, "darwin")).toEqual({
      transparent: false,
      backgroundColor: getBackgroundColor(true),
    });
    expect(getWindowBackground(false, "win32").transparent).toBe(false);
  });
});
