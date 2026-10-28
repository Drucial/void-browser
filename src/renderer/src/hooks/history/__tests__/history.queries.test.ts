import { describe, expect, it } from "vitest";

import { historyQueries } from "@/hooks/history/history.queries";

describe("historyQueries.search", () => {
  it("shares one cache key across case and surrounding whitespace", () => {
    expect(historyQueries.search("  Foo ").queryKey).toEqual(
      historyQueries.search("foo").queryKey
    );
    expect(historyQueries.search("   ").queryKey).toEqual(
      historyQueries.search("").queryKey
    );
  });
});
