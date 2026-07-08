import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "../../src/types.js";

const MIGRATIONS_DIR = join(import.meta.dirname, "../../supabase/migrations");

/** In-process Postgres with all migrations applied, exposed as our Db interface. */
export async function createMigratedDb(): Promise<
  Db & { raw: PGlite; close(): Promise<void> }
> {
  const pg = new PGlite();
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    if (!file.endsWith(".sql")) continue;
    await pg.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  return {
    raw: pg,
    async query<R>(text: string, values?: unknown[]) {
      const res = await pg.query<R>(text, values);
      return { rows: res.rows };
    },
    async ping() {
      await pg.query("SELECT 1");
    },
    async close() {
      await pg.close();
    },
  };
}
