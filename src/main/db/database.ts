import type BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

export type AppDatabase = ReturnType<typeof createDatabase>;

/** Applies the app pragmas to `sqlite` and returns a Drizzle handle over it. */
export function createDatabase(sqlite: BetterSqlite3.Database) {
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");

  return drizzle(sqlite, { schema });
}

/** Creates the Drizzle handle over `sqlite` and applies the migrations in `migrationsFolder`. */
export function openMigratedDatabase(
  sqlite: BetterSqlite3.Database,
  migrationsFolder: string
) {
  const db = createDatabase(sqlite);
  migrate(db, { migrationsFolder });

  return db;
}
