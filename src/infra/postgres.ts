import pg from "pg";
import type { Db } from "../types.js";

export function createDb(databaseUrl: string): Db & { close(): Promise<void> } {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
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
