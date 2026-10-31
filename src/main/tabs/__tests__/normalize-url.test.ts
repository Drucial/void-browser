import { describe, expect, it } from "vitest";

import { isAllowedUrl } from "../normalize-url";

describe("isAllowedUrl", () => {
  it("allows http(s) and blocks file, custom and error-page schemes", () => {
    expect(isAllowedUrl("https://example.com/")).toBe(true);
    expect(isAllowedUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedUrl("void://settings")).toBe(false);
    expect(isAllowedUrl("chrome-error://chromewebdata/")).toBe(false);
  });
});
