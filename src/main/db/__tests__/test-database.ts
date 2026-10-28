import { resolve } from "node:path";

import Database from "better-sqlite3";

import { openMigratedDatabase } from "../database";

export function createTestDatabase() {
  return openMigratedDatabase(
    new Database(":memory:"),
    resolve(__dirname, "../../../../drizzle")
  );
}
