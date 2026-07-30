import { describe, it, expect, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";
import { createFakeKv, testConfig } from "../helpers/fakes.js";
import type { Db } from "../../src/types.js";
import type { NewsCandidate } from "../../src/ingestion/types.js";

let app: FastifyInstance;
afterEach(async () => app.close());

function fakeDb(): Db {
  return {
    async query() {
      return { rows: [] };
    },
    async ping() {},
  };
}

async function build(
  overrides: {
    everyOrgApiKey?: string;
    fetchNews?: () => Promise<NewsCandidate[]>;
    searchCharities?: (
      searchTerm: string,
      apiKey: string,
      take: number,
    ) => Promise<unknown[]>;
  } = {},
) {
  app = buildApp(
    { ...testConfig(), everyOrgApiKey: overrides.everyOrgApiKey },
    {
      db: fakeDb(),
      kv: createFakeKv(),
      verifyAppleToken: async () => ({ sub: "x", email: null }),
      fetchNews: overrides.fetchNews,
      searchCharities: overrides.searchCharities as never,
    },
  );
  await app.ready();
}

const wildfire: NewsCandidate = {
  headline: "Wildfire relief effort expands",
  canonicalUrl: "https://example.com/wildfire",
  sourceSlug: "example.com",
  publishedAt: new Date("2026-07-27T12:00:00Z"),
  summary: "A third wildfire this month forces new evacuations.",
  imageUrl: "https://example.com/wildfire.jpg",
};
const equalPay: NewsCandidate = {
  headline: "Gap in equal pay narrows in tech sector",
  canonicalUrl: "https://example.com/equal-pay",
  sourceSlug: "example.com",
  publishedAt: new Date("2026-07-27T12:00:00Z"),
};

describe("GET /dev/news", () => {
  it("returns real candidates unfiltered when no topics are requested", async () => {
    await build({ fetchNews: async () => [wildfire, equalPay] });
    const res = await app.inject({ method: "GET", url: "/dev/news" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.live).toBe(true);
    expect(body.articles).toHaveLength(2);
  });

  it("filters candidates by topic keyword against headline+summary", async () => {
    await build({ fetchNews: async () => [wildfire, equalPay] });
    const res = await app.inject({
      method: "GET",
      url: "/dev/news?topics=disaster-relief",
    });
    const body = res.json();
    expect(body.articles).toHaveLength(1);
    expect(body.articles[0].headline).toBe(wildfire.headline);
    expect(body.articles[0].matchedTopics).toEqual(["disaster-relief"]);
    expect(body.articles[0].imageUrl).toBe(wildfire.imageUrl);
  });

  it("returns null imageUrl when the source candidate has none", async () => {
    await build({ fetchNews: async () => [equalPay] });
    const res = await app.inject({ method: "GET", url: "/dev/news" });
    expect(res.json().articles[0].imageUrl).toBeNull();
  });

  it("matches against multiple requested topics and tags each article with which ones matched", async () => {
    await build({ fetchNews: async () => [wildfire, equalPay] });
    const res = await app.inject({
      method: "GET",
      url: "/dev/news?topics=disaster-relief,equal-pay",
    });
    const body = res.json();
    expect(body.articles).toHaveLength(2);
    expect(
      body.articles.find(
        (a: { headline: string }) => a.headline === wildfire.headline,
      ).matchedTopics,
    ).toEqual(["disaster-relief"]);
    expect(
      body.articles.find(
        (a: { headline: string }) => a.headline === equalPay.headline,
      ).matchedTopics,
    ).toEqual(["equal-pay"]);
  });
});

describe("GET /dev/charities", () => {
  it("returns 503 when EVERY_ORG_API_KEY is not configured", async () => {
    await build();
    const res = await app.inject({ method: "GET", url: "/dev/charities" });
    expect(res.statusCode).toBe(503);
  });

  it("returns real nonprofits for a topic when a key is configured", async () => {
    let calledWith: [string, string, number] | null = null;
    await build({
      everyOrgApiKey: "test-key",
      searchCharities: async (searchTerm, apiKey, take) => {
        calledWith = [searchTerm, apiKey, take];
        return [{ id: "coastal-paws-rescue", name: "Coastal Paws Rescue" }];
      },
    });
    const res = await app.inject({
      method: "GET",
      url: "/dev/charities?topic=animal-rights",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.live).toBe(true);
    expect(body.nonprofits).toEqual([
      { id: "coastal-paws-rescue", name: "Coastal Paws Rescue" },
    ]);
    expect(calledWith).toEqual(["animal welfare", "test-key", 10]);
  });

  it("falls back to the raw topic id as the search term when it isn't mapped", async () => {
    let calledWith: [string, string, number] | null = null;
    await build({
      everyOrgApiKey: "test-key",
      searchCharities: async (searchTerm, apiKey, take) => {
        calledWith = [searchTerm, apiKey, take];
        return [];
      },
    });
    await app.inject({
      method: "GET",
      url: "/dev/charities?topic=unmapped-topic",
    });
    expect(calledWith).toEqual(["unmapped-topic", "test-key", 10]);
  });
});
