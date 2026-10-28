import { describe, expect, it } from "vitest";

import { cleanUserAgent } from "../clean-user-agent";

describe("cleanUserAgent", () => {
  it("drops the Electron and app tokens and keeps the browser ones", () => {
    const userAgent =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) void-browser/0.1.0 Chrome/156.0.8078.49 Electron/45.1.0 Safari/537.36";

    expect(cleanUserAgent(userAgent, "void-browser")).toBe(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.8078.49 Safari/537.36"
    );
  });
});
