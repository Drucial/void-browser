import { describe, expect, it } from "vitest";

import { getUrl, recordVisit, searchHistory, setUrlTitle } from "../history";
import { urls, visits } from "../schema";
import { createTestDatabase } from "./test-database";

describe("recordVisit", () => {
  it("counts repeat visits on one url row and keeps a visit row per visit", () => {
    const db = createTestDatabase();

    recordVisit(db, { url: "https://a.test", title: "A", visitedAt: 100 });
    recordVisit(db, { url: "https://a.test", title: "A2", visitedAt: 200 });
    recordVisit(db, { url: "https://b.test", title: "B", visitedAt: 150 });

    expect(getUrl(db, "https://a.test")).toMatchObject({
      title: "A2",
      visitCount: 2,
      lastVisitAt: 200,
    });
    expect(db.select().from(urls).all()).toHaveLength(2);
    expect(db.select().from(visits).all()).toHaveLength(3);
  });

  it("removes visits when their url is deleted", () => {
    const db = createTestDatabase();
    recordVisit(db, { url: "https://a.test", title: "A", visitedAt: 100 });

    db.delete(urls).run();

    expect(db.select().from(visits).all()).toHaveLength(0);
  });
});

describe("setUrlTitle", () => {
  it("updates the title of a recorded url without creating rows for unknown urls", () => {
    const db = createTestDatabase();
    recordVisit(db, { url: "https://a.test", title: "", visitedAt: 100 });

    setUrlTitle(db, "https://a.test", "Loaded title");
    setUrlTitle(db, "https://unknown.test", "Ghost");

    expect(getUrl(db, "https://a.test")).toMatchObject({
      title: "Loaded title",
      visitCount: 1,
      lastVisitAt: 100,
    });
    expect(db.select().from(urls).all()).toHaveLength(1);
  });
});

describe("searchHistory", () => {
  function seed() {
    const db = createTestDatabase();
    recordVisit(db, {
      url: "https://docs.test/Guide",
      title: "Setup",
      visitedAt: 100,
    });
    recordVisit(db, {
      url: "https://news.test",
      title: "Daily Guide",
      visitedAt: 300,
    });
    recordVisit(db, {
      url: "https://shop.test/50%_off",
      title: "Sale",
      visitedAt: 200,
    });
    recordVisit(db, {
      url: "https://other.test",
      title: "Other",
      visitedAt: 50,
    });

    return db;
  }

  it("matches title or url case-insensitively, most recent first", () => {
    const results = searchHistory(seed(), "guide", 30);

    expect(results.map((entry) => entry.url)).toEqual([
      "https://news.test",
      "https://docs.test/Guide",
    ]);
  });

  it("requires every term, each in the title or the url", () => {
    const results = searchHistory(seed(), "  guide   setup ", 30);

    expect(results.map((entry) => entry.url)).toEqual([
      "https://docs.test/Guide",
    ]);
  });

  it("treats LIKE wildcards in the query literally", () => {
    const db = seed();

    expect(searchHistory(db, "50%_", 30)).toHaveLength(1);
    expect(searchHistory(db, "%", 30)).toHaveLength(1);
    expect(searchHistory(db, "_ther", 30)).toHaveLength(0);
  });

  it("returns the most recent entries up to the limit for a blank query", () => {
    const results = searchHistory(seed(), "   ", 2);

    expect(results.map((entry) => entry.url)).toEqual([
      "https://news.test",
      "https://shop.test/50%_off",
    ]);
  });
});
