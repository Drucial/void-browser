import { describe, expect, it } from "vitest";

import { getPaletteList } from "@/components/overlay/utils/get-palette-list";

const RESULTS = [{ id: 1, url: "https://example.com/", title: "Example" }];
const URL_PREFILL = "https://current.test/";

describe("getPaletteList", () => {
  it("hides the list until a prefilled address changes", () => {
    const untouched = getPaletteList({
      query: URL_PREFILL,
      initialQuery: URL_PREFILL,
      results: RESULTS,
      isSettled: true,
    });
    const edited = getPaletteList({
      query: "exa",
      initialQuery: URL_PREFILL,
      results: RESULTS,
      isSettled: true,
    });

    expect(untouched).toEqual({
      results: [],
      isShown: false,
      hasNoMatches: false,
    });
    expect(edited.results).toEqual(RESULTS);
    expect(edited.isShown).toBe(true);
  });

  it("shows recent entries on an empty open and never reports no matches before typing", () => {
    const withRecent = getPaletteList({
      query: "",
      initialQuery: "",
      results: RESULTS,
      isSettled: true,
    });
    const emptyHistory = getPaletteList({
      query: "",
      initialQuery: "",
      results: [],
      isSettled: true,
    });

    expect(withRecent.results).toEqual(RESULTS);
    expect(emptyHistory.hasNoMatches).toBe(false);
  });

  it("reports no matches only after an edit settles empty", () => {
    const base = { query: "zzz", initialQuery: "", results: [] };

    expect(getPaletteList({ ...base, isSettled: false }).hasNoMatches).toBe(
      false
    );
    expect(getPaletteList({ ...base, isSettled: true }).hasNoMatches).toBe(
      true
    );
  });
});
