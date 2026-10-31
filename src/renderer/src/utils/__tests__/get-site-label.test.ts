import { describe, expect, it } from "vitest";

import { getSiteLabel } from "@/utils/get-site-label";

describe("getSiteLabel", () => {
  it("shows the host without scheme or path", () => {
    expect(getSiteLabel("https://www.electronjs.org/docs/latest")).toBe(
      "www.electronjs.org"
    );
  });

  it("falls back to the raw text when it is not a url", () => {
    expect(getSiteLabel("")).toBe("");
    expect(getSiteLabel("not a url")).toBe("not a url");
  });
});
