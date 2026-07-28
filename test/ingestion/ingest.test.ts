import { describe, it, expect } from "vitest";
import { runIngestion } from "../../src/ingestion/ingest.js";
import { createFakeKv, createFakeQueue, testConfig } from "../helpers/fakes.js";
import type { Db } from "../../src/types.js";
import type { NewsCandidate } from "../../src/ingestion/types.js";

function fakeDb(): Db {
  let nextId = 1;
  return {
    async query<R = unknown>() {
      return { rows: [{ id: String(nextId++) }] as R[] };
    },
    async ping() {},
  };
}

const wildfire: NewsCandidate = {
  headline: "Wildfire relief effort expands",
  canonicalUrl: "https://cnn.com/wildfire",
  sourceSlug: "cnn.com",
  publishedAt: new Date(),
};

const shelters: NewsCandidate = {
  headline: "New shelters open for displaced families",
  canonicalUrl: "https://apnews.com/shelters",
  sourceSlug: "apnews",
  publishedAt: new Date(),
};

describe("runIngestion", () => {
  it("inserts new candidates from both sources and enqueues a job for each", async () => {
    const db = fakeDb();
    const kv = createFakeKv();
    const queue = createFakeQueue();

    const result = await runIngestion({
      db,
      kv,
      queue,
      config: testConfig(),
      fetchGdelt: async () => [wildfire],
      fetchRss: async () => [shelters],
    });

    expect(result).toEqual({ inserted: 2, skipped: 0 });
    expect(queue.jobs).toHaveLength(2);
    expect(queue.jobs.map((j) => j.name)).toEqual([
      "event.detected",
      "event.detected",
    ]);
  });

  it("dedupes the same story reported by both GDELT and RSS", async () => {
    const db = fakeDb();
    const kv = createFakeKv();
    const queue = createFakeQueue();

    const result = await runIngestion({
      db,
      kv,
      queue,
      config: testConfig(),
      fetchGdelt: async () => [wildfire],
      // Same headline + domain as the GDELT result — should be deduped, not double-inserted.
      fetchRss: async () => [{ ...wildfire }],
    });

    expect(result).toEqual({ inserted: 1, skipped: 1 });
    expect(queue.jobs).toHaveLength(1);
  });

  it("continues with RSS results when GDELT fails", async () => {
    const db = fakeDb();
    const kv = createFakeKv();
    const queue = createFakeQueue();

    const result = await runIngestion({
      db,
      kv,
      queue,
      config: testConfig(),
      fetchGdelt: async () => {
        throw new Error("GDELT unreachable");
      },
      fetchRss: async () => [shelters],
    });

    expect(result).toEqual({ inserted: 1, skipped: 0 });
  });

  it("returns zero counts when both sources fail", async () => {
    const db = fakeDb();
    const kv = createFakeKv();
    const queue = createFakeQueue();

    const result = await runIngestion({
      db,
      kv,
      queue,
      config: testConfig(),
      fetchGdelt: async () => {
        throw new Error("GDELT unreachable");
      },
      fetchRss: async () => {
        throw new Error("RSS unreachable");
      },
    });

    expect(result).toEqual({ inserted: 0, skipped: 0 });
    expect(queue.jobs).toHaveLength(0);
  });
});
