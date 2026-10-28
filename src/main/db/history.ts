import { and, desc, eq, or, sql } from "drizzle-orm";

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

function containsPattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

function matchesTerm(term: string) {
  const pattern = containsPattern(term);

  return or(
    sql`${urls.title} like ${pattern} escape '\\'`,
    sql`${urls.url} like ${pattern} escape '\\'`
  );
}

/** Returns up to `limit` urls, most recently visited first, whose title or url contains every whitespace-separated term of `query`; a blank query returns the most recent. */
export function searchHistory(db: AppDatabase, query: string, limit: number) {
  const terms = query.split(/\s+/).filter(Boolean);

  return db
    .select({ id: urls.id, url: urls.url, title: urls.title })
    .from(urls)
    .where(and(...terms.map(matchesTerm)))
    .orderBy(desc(urls.lastVisitAt))
    .limit(limit)
    .all();
}

export function getUrl(db: AppDatabase, url: string) {
  return db.select().from(urls).where(eq(urls.url, url)).get();
}
