import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestDatabase } from "../../db/__tests__/test-database";
import { setThemePreference } from "../../db/settings";

const fakeTheme = await vi.hoisted(async () => {
  const { EventEmitter } = await import("node:events");

  return {
    emitter: new EventEmitter(),
    themeSource: "system",
    shouldUseDarkColors: false,
  };
});

vi.mock("electron", () => {
  Object.defineProperties(fakeTheme.emitter, {
    themeSource: {
      get: () => fakeTheme.themeSource,
      set: (value: string) => {
        fakeTheme.themeSource = value;
        fakeTheme.shouldUseDarkColors = value === "dark";
      },
    },
    shouldUseDarkColors: { get: () => fakeTheme.shouldUseDarkColors },
  });

  return { nativeTheme: fakeTheme.emitter };
});

const { createThemeController } = await import("../theme-controller");

describe("createThemeController", () => {
  beforeEach(() => {
    fakeTheme.themeSource = "system";
    fakeTheme.shouldUseDarkColors = false;
  });

  it("applies the stored preference to nativeTheme at creation", () => {
    const db = createTestDatabase();
    setThemePreference(db, "dark");

    const theme = createThemeController(db);

    expect(fakeTheme.themeSource).toBe("dark");
    expect(theme.getState()).toEqual({ preference: "dark", isDark: true });
  });

  it("persists a new preference, applies it and notifies listeners", () => {
    const theme = createThemeController(createTestDatabase());
    const listener = vi.fn();
    theme.onChanged(listener);

    theme.setPreference("dark");

    expect(fakeTheme.themeSource).toBe("dark");
    expect(listener).toHaveBeenCalledWith({ preference: "dark", isDark: true });
  });

  it("notifies listeners when the system theme changes", () => {
    const theme = createThemeController(createTestDatabase());
    const listener = vi.fn();
    theme.onChanged(listener);

    fakeTheme.shouldUseDarkColors = true;
    fakeTheme.emitter.emit("updated");

    expect(listener).toHaveBeenCalledWith({
      preference: "system",
      isDark: true,
    });
  });
});
