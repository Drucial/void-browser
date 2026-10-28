import { describe, expect, it } from "vitest";

import { closeTab, createTab, listTabs, updateTab } from "../tabs";
import { createTestDatabase } from "./test-database";

describe("tabs", () => {
  it("lists tabs in creation order and appends after closed gaps", () => {
    const db = createTestDatabase();
    const first = createTab(db, { url: "https://a.test" });
    createTab(db, { url: "https://b.test" });

    closeTab(db, first.id);
    createTab(db, { url: "https://c.test" });

    expect(listTabs(db).map((tab) => tab.url)).toEqual([
      "https://b.test",
      "https://c.test",
    ]);
  });

  it("updates only the patched fields of the matching tab", () => {
    const db = createTestDatabase();
    const tab = createTab(db, { url: "https://a.test", title: "A" });
    createTab(db, { url: "https://b.test", title: "B" });

    updateTab(db, tab.id, { title: "Renamed" });

    expect(listTabs(db).map(({ url, title }) => ({ url, title }))).toEqual([
      { url: "https://a.test", title: "Renamed" },
      { url: "https://b.test", title: "B" },
    ]);
  });
});
