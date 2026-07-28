import { describe, it, expect } from "vitest";
import { fetchGdeltCandidates } from "../../src/ingestion/gdelt.js";

function fakeFetch(response: Partial<Response>): typeof fetch {
  return (async () => response as Response) as typeof fetch;
}

describe("fetchGdeltCandidates", () => {
  it("maps GDELT articles into candidates", async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: async () => ({
        articles: [
          {
            url: "https://example.com/wildfire",
            title: "Wildfire relief effort expands",
            domain: "example.com",
            seendate: "20260727T120000Z",
          },
        ],
      }),
    });

    const candidates = await fetchGdeltCandidates("wildfire", fetchImpl);
    expect(candidates).toEqual([
      {
        headline: "Wildfire relief effort expands",
        canonicalUrl: "https://example.com/wildfire",
        sourceSlug: "example.com",
        publishedAt: new Date(Date.UTC(2026, 6, 27, 12, 0, 0)),
      },
    ]);
  });

  it("skips articles missing required fields", async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: async () => ({
        articles: [
          { url: "https://example.com/a" },
          { title: "No URL here", domain: "x.com" },
        ],
      }),
    });

    await expect(fetchGdeltCandidates("wildfire", fetchImpl)).resolves.toEqual(
      [],
    );
  });

  it("tolerates a response with no articles field", async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({}) });
    await expect(fetchGdeltCandidates("wildfire", fetchImpl)).resolves.toEqual(
      [],
    );
  });

  it("throws on a non-OK response", async () => {
    const fetchImpl = fakeFetch({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });
    await expect(fetchGdeltCandidates("wildfire", fetchImpl)).rejects.toThrow(
      /500/,
    );
  });
});
