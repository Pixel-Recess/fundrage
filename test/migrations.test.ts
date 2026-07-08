import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMigratedDb } from "./helpers/pglite.js";

let db: Awaited<ReturnType<typeof createMigratedDb>>;

beforeAll(async () => {
  db = await createMigratedDb();
});
afterAll(async () => {
  await db.close();
});

describe("schema migrations", () => {
  it("creates all 10 spec §3 tables", async () => {
    const { rows } = await db.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    const names = rows.map((r) => r.table_name).sort();
    expect(names).toEqual(
      [
        "behavior_events",
        "charities",
        "donations",
        "event_charity_matches",
        "news_events",
        "pushes",
        "topics",
        "user_sources",
        "user_topics",
        "users",
      ].sort(),
    );
  });

  it("seeds the topic taxonomy (20–40 rows, unique slugs, cause codes present)", async () => {
    const { rows } = await db.query<{ slug: string; cause_codes: string[] }>(
      "SELECT slug, cause_codes FROM topics",
    );
    expect(rows.length).toBeGreaterThanOrEqual(20);
    expect(rows.length).toBeLessThanOrEqual(40);
    for (const t of rows) expect(t.cause_codes.length).toBeGreaterThan(0);
  });

  it("enforces one push per user per event (dedup gate §6.6)", async () => {
    await db.query(`INSERT INTO users (apple_sub) VALUES ('dedup-user')`);
    await db.query(`INSERT INTO news_events (headline) VALUES ('h')`);
    const insert = `
      INSERT INTO pushes (user_id, event_id)
      SELECT u.id, e.id FROM users u, news_events e
      WHERE u.apple_sub = 'dedup-user' AND e.headline = 'h'`;
    await db.query(insert);
    await expect(db.query(insert)).rejects.toThrow(/duplicate key/);
  });
});

describe("behavior_events append-only guarantees", () => {
  beforeAll(async () => {
    await db.query(`INSERT INTO users (apple_sub) VALUES ('behavior-user')`);
    await db.query(
      `INSERT INTO behavior_events (user_id, kind)
       SELECT id, 'give'::behavior_kind FROM users WHERE apple_sub = 'behavior-user'`,
    );
  });

  it("rejects DELETE", async () => {
    await expect(db.query("DELETE FROM behavior_events")).rejects.toThrow(
      /append-only/,
    );
  });

  it("rejects UPDATE that mutates data", async () => {
    await expect(
      db.query(`UPDATE behavior_events SET kind = 'push_open'`),
    ).rejects.toThrow(/tombstoned/);
  });

  it("allows tombstoning (user_id -> null) for account deletion", async () => {
    await db.query("UPDATE behavior_events SET user_id = NULL");
    const { rows } = await db.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM behavior_events WHERE user_id IS NULL",
    );
    expect(rows[0]?.n).toBeGreaterThan(0);
  });
});
