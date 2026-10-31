import { describe, expect, it } from "vitest";

import { resolveSubmission } from "@/components/overlay/utils/resolve-submission";

const RESULTS = [
  { id: 1, url: "https://example.com/", title: "Example" },
  { id: 2, url: "https://example.org/", title: "" },
];

describe("resolveSubmission", () => {
  it("opens the highlighted result and carries the new-tab choice", () => {
    expect(
      resolveSubmission({
        query: "exa",
        results: RESULTS,
        highlightedUrl: "https://example.org/",
        isNewTab: true,
      })
    ).toEqual({ url: "https://example.org/", newTab: true });
  });

  it("falls back to the typed text when the highlight is no longer listed", () => {
    expect(
      resolveSubmission({
        query: " nowhere.dev ",
        results: [],
        highlightedUrl: "https://example.com/",
        isNewTab: false,
      })
    ).toEqual({ url: "nowhere.dev", newTab: false });
  });

  it("does nothing when there is neither a result nor text", () => {
    expect(
      resolveSubmission({
        query: "  ",
        results: [],
        highlightedUrl: "",
        isNewTab: false,
      })
    ).toBeNull();
  });
});
