import { eq } from "drizzle-orm";
import { z } from "zod";

import type { AppDatabase } from "./database";
import { settings } from "./schema";

export const themePreferenceSchema = z.enum(["light", "dark", "system"]);

export type ThemePreference = z.infer<typeof themePreferenceSchema>;

const THEME_KEY = "theme";

/** Returns the stored theme preference, or "system" when none is stored or the stored value is invalid. */
export function getThemePreference(db: AppDatabase): ThemePreference {
  const row = db
    .select()
    .from(settings)
    .where(eq(settings.key, THEME_KEY))
    .get();
  const parsed = themePreferenceSchema.safeParse(row?.value);

  return parsed.success ? parsed.data : "system";
}

/** Persists `preference`. Throws if it is not light, dark or system. */
export function setThemePreference(db: AppDatabase, preference: string) {
  const value = themePreferenceSchema.parse(preference);

  db.insert(settings)
    .values({ key: THEME_KEY, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}
