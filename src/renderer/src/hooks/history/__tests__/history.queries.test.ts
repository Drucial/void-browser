import { describe, expect, it } from "vitest";

import { historyQueries } from "@/hooks/history/history.queries";

describe("historyQueries.search", () => {
  it("shares one cache key across surrounding whitespace but not case", () => {
    expect(historyQueries.search("  Foo ").queryKey).toEqual(
      historyQueries.search("Foo").queryKey
    );
    expect(historyQueries.search("Foo").queryKey).not.toEqual(
      historyQueries.search("foo").queryKey
    );
    expect(historyQueries.search("   ").queryKey).toEqual(
      historyQueries.search("").queryKey
    );
  });

  it("disables queries longer than main accepts", () => {
    expect(historyQueries.search("a".repeat(500)).enabled).toBe(true);
    expect(historyQueries.search("a".repeat(501)).enabled).toBe(false);
  });
});
