import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tabs = sqliteTable("tabs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  position: integer("position").notNull(),
});

export const urls = sqliteTable(
  "urls",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    url: text("url").notNull().unique(),
    title: text("title").notNull().default(""),
    visitCount: integer("visit_count").notNull().default(0),
    lastVisitAt: integer("last_visit_at").notNull(),
  },
  (table) => [
    index("urls_last_visit_at_idx").on(sql`${table.lastVisitAt} desc`),
  ]
);

export const visits = sqliteTable(
  "visits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    urlId: integer("url_id")
      .notNull()
      .references(() => urls.id, { onDelete: "cascade" }),
    visitedAt: integer("visited_at").notNull(),
  },
  (table) => [
    index("visits_url_id_visited_at_idx").on(table.urlId, table.visitedAt),
  ]
);
