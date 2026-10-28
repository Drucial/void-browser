import { asc, eq, sql } from "drizzle-orm";

import type { AppDatabase } from "./database";
import { tabs } from "./schema";

export function listTabs(db: AppDatabase) {
  return db.select().from(tabs).orderBy(asc(tabs.position)).all();
}

/** Appends a tab after the last one. */
export function createTab(
  db: AppDatabase,
  input: { url: string; title?: string }
) {
  return db
    .insert(tabs)
    .values({
      url: input.url,
      title: input.title,
      position: sql`(select coalesce(max(${tabs.position}), -1) + 1 from ${tabs})`,
    })
    .returning()
    .get();
}

export function updateTab(
  db: AppDatabase,
  id: number,
  patch: { url?: string; title?: string }
) {
  return db.update(tabs).set(patch).where(eq(tabs.id, id)).returning().get();
}

export function closeTab(db: AppDatabase, id: number) {
  db.delete(tabs).where(eq(tabs.id, id)).run();
}
