import { nativeTheme } from "electron";

import type { ThemeState } from "../../shared/ipc";
import type { AppDatabase } from "../db/database";
import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from "../db/settings";

export type ThemeController = ReturnType<typeof createThemeController>;

/** Applies the stored preference to nativeTheme immediately and owns changes to it. */
export function createThemeController(db: AppDatabase) {
  const listeners = new Set<(state: ThemeState) => void>();

  nativeTheme.themeSource = getThemePreference(db);

  function getState(): ThemeState {
    return {
      preference: getThemePreference(db),
      isDark: nativeTheme.shouldUseDarkColors,
    };
  }

  function emitChanged() {
    const state = getState();
    listeners.forEach((listener) => listener(state));
  }

  nativeTheme.on("updated", emitChanged);

  function setPreference(preference: ThemePreference) {
    setThemePreference(db, preference);
    nativeTheme.themeSource = preference;
    emitChanged();
  }

  function onChanged(listener: (state: ThemeState) => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
  }

  return { getState, setPreference, onChanged };
}
