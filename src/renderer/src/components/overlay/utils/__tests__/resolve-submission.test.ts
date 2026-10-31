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
        isKeepingPrefill: false,
      })
    ).toEqual({ url: "https://example.org/", newTab: true });
  });

  it("opens the first result before anything is highlighted", () => {
    expect(
      resolveSubmission({
        query: "exa",
        results: RESULTS,
        highlightedUrl: "",
        isNewTab: false,
        isKeepingPrefill: false,
      })
    ).toEqual({ url: "https://example.com/", newTab: false });
  });

  it("falls back to the typed text when there are no results", () => {
    expect(
      resolveSubmission({
        query: " nowhere.dev ",
        results: [],
        highlightedUrl: "https://example.com/",
        isNewTab: false,
        isKeepingPrefill: false,
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
        isKeepingPrefill: false,
      })
    ).toBeNull();
  });

  it("submits an untouched prefill instead of a listed result", () => {
    expect(
      resolveSubmission({
        query: "https://current.test/",
        results: RESULTS,
        highlightedUrl: "https://example.com/",
        isNewTab: false,
        isKeepingPrefill: true,
      })
    ).toEqual({ url: "https://current.test/", newTab: false });
  });
});
