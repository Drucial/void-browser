import { describe, expect, it } from "vitest";

import { resolveSubmission } from "@/components/overlay/utils/resolve-submission";

const RESULTS = [
  { id: 1, url: "https://example.com/", title: "Example" },
  { id: 2, url: "https://example.org/", title: "" },
];

const base = {
  query: "exa",
  results: RESULTS,
  highlightedUrl: "",
  hasMovedHighlight: false,
  isNewTab: false,
};

describe("resolveSubmission", () => {
  it("opens the history result the user arrowed to and carries the new-tab choice", () => {
    expect(
      resolveSubmission({
        ...base,
        highlightedUrl: "https://example.org/",
        hasMovedHighlight: true,
        isNewTab: true,
      })
    ).toEqual({ url: "https://example.org/", newTab: true });
  });

  it("submits the typed text when the action row is the default or highlighted", () => {
    expect(resolveSubmission(base)).toEqual({ url: "exa", newTab: false });
    expect(
      resolveSubmission({
        ...base,
        highlightedUrl: "address-action",
        hasMovedHighlight: true,
      })
    ).toEqual({ url: "exa", newTab: false });
  });

  it("submits an untouched prefill instead of a listed result", () => {
    expect(
      resolveSubmission({ ...base, query: " https://current.test/ " })
    ).toEqual({ url: "https://current.test/", newTab: false });
  });

  it("opens the first recent result on a blank query, or nothing without one", () => {
    expect(resolveSubmission({ ...base, query: "" })).toEqual({
      url: "https://example.com/",
      newTab: false,
    });
    expect(resolveSubmission({ ...base, query: "  ", results: [] })).toBeNull();
  });
});
