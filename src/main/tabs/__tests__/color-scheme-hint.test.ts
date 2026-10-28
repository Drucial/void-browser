import { describe, expect, it } from "vitest";

import { withColorSchemeHint } from "../color-scheme-hint";

describe("withColorSchemeHint", () => {
  it("sets the hint from the theme and keeps the other headers", () => {
    const headers = { Accept: "text/html" };

    expect(withColorSchemeHint(headers, true)).toEqual({
      Accept: "text/html",
      "Sec-CH-Prefers-Color-Scheme": "dark",
    });
    expect(withColorSchemeHint(headers, false)).toMatchObject({
      "Sec-CH-Prefers-Color-Scheme": "light",
    });
  });
});
