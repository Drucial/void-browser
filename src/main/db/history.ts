import { eq, sql } from "drizzle-orm";

import type { AppDatabase } from "./database";
import { urls, visits } from "./schema";

type Visit = { url: string; title: string; visitedAt: number };

/** Upserts the url, bumps its visit count and last visit, and appends a visit row. */
export function recordVisit(db: AppDatabase, { url, title, visitedAt }: Visit) {
  db.transaction((tx) => {
    const row = tx
      .insert(urls)
      .values({ url, title, visitCount: 1, lastVisitAt: visitedAt })
      .onConflictDoUpdate({
        target: urls.url,
        set: {
          title,
          visitCount: sql`${urls.visitCount} + 1`,
          lastVisitAt: visitedAt,
        },
      })
      .returning({ id: urls.id })
      .get();
    tx.insert(visits).values({ urlId: row.id, visitedAt }).run();
  });
}

/** Updates the title of an already-recorded url; does nothing for an unknown url. */
export function setUrlTitle(db: AppDatabase, url: string, title: string) {
  db.update(urls).set({ title }).where(eq(urls.url, url)).run();
}

export function getUrl(db: AppDatabase, url: string) {
  return db.select().from(urls).where(eq(urls.url, url)).get();
}
