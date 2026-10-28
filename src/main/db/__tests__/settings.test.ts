import { describe, expect, it } from "vitest";

import { getThemePreference, setThemePreference } from "../settings";
import { createTestDatabase } from "./test-database";

describe("theme preference", () => {
  it("defaults to system", () => {
    expect(getThemePreference(createTestDatabase())).toBe("system");
  });

  it("returns the latest value set", () => {
    const db = createTestDatabase();

    setThemePreference(db, "dark");
    setThemePreference(db, "light");

    expect(getThemePreference(db)).toBe("light");
  });

  it("rejects an unknown value and keeps the stored one", () => {
    const db = createTestDatabase();
    setThemePreference(db, "dark");

    expect(() => setThemePreference(db, "sepia")).toThrow();
    expect(getThemePreference(db)).toBe("dark");
  });
});
