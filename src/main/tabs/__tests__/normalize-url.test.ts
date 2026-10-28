import { describe, expect, it } from "vitest";

import { normalizeUrl } from "../normalize-url";

describe("normalizeUrl", () => {
  it("defaults a missing scheme to https", () => {
    expect(normalizeUrl("example.com/a")).toBe("https://example.com/a");
    expect(normalizeUrl("localhost:3000")).toBe("https://localhost:3000/");
  });

  it("keeps an explicit http scheme", () => {
    expect(normalizeUrl(" http://example.com ")).toBe("http://example.com/");
  });

  it("rejects non-http(s) schemes and unusable input", () => {
    expect(normalizeUrl("file:///etc/passwd")).toBeNull();
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("   ")).toBeNull();
  });
});
