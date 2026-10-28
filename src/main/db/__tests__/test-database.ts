import { resolve } from "node:path";

import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { createDatabase } from "../database";

export function createTestDatabase() {
  const db = createDatabase(new Database(":memory:"));
  migrate(db, { migrationsFolder: resolve(__dirname, "../../../../drizzle") });

  return db;
}
