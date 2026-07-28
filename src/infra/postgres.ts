import pg from "pg";
import type { Db } from "../types.js";

export function createDb(databaseUrl: string): Db & { close(): Promise<void> } {
  // Local Postgres (dev/CI) has no SSL listener; hosted providers like Supabase
  // require it for external connections. rejectUnauthorized: false skips CA
  // verification (Supabase's cert chain isn't in Node's default trust store)
  // while still encrypting the connection.
  const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 10,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  return {
    async query(text, values) {
      const res = await pool.query(text, values);
      return { rows: res.rows };
    },
    async ping() {
      await pool.query("SELECT 1");
    },
    async close() {
      await pool.end();
    },
  };
}
