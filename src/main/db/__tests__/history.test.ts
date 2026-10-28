import { describe, expect, it } from "vitest";

import { getUrl, recordVisit } from "../history";
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
