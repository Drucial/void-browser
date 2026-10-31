import { describe, expect, it } from "vitest";

import {
  isAllowedUrl,
  normalizeUrl,
  resolveAddressInput,
} from "../normalize-url";

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

describe("isAllowedUrl", () => {
  it("allows http(s) and blocks file, custom and error-page schemes", () => {
    expect(isAllowedUrl("https://example.com/")).toBe(true);
    expect(isAllowedUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedUrl("void://settings")).toBe(false);
    expect(isAllowedUrl("chrome-error://chromewebdata/")).toBe(false);
  });
});

describe("resolveAddressInput", () => {
  it.each([
    ["google.com", "url", "https://google.com/"],
    ["https://x.dev/a?b=1", "url", "https://x.dev/a?b=1"],
    ["localhost:3000", "url", "https://localhost:3000/"],
    ["192.168.0.1", "url", "https://192.168.0.1/"],
    ["münchen.de", "url", "https://xn--mnchen-3ya.de/"],
    ["cats", "search", "https://duckduckgo.com/?q=cats"],
    ["foo bar", "search", "https://duckduckgo.com/?q=foo%20bar"],
    ["3.14", "search", "https://duckduckgo.com/?q=3.14"],
    ["a&b #1", "search", "https://duckduckgo.com/?q=a%26b%20%231"],
  ])("resolves %s as a %s", (input, kind, url) => {
    expect(resolveAddressInput(input)).toEqual({ kind, url });
  });

  it("returns null for blank text and non-http(s) schemes instead of searching", () => {
    expect(resolveAddressInput("   ")).toBeNull();
    expect(resolveAddressInput("javascript:alert(1)")).toBeNull();
    expect(resolveAddressInput("file:///etc/passwd")).toBeNull();
  });
});
