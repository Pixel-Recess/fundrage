import { describe, it, expect } from "vitest";
import { fetchRssCandidates, type ParseFeed } from "../../src/ingestion/rss.js";
import type { RssFeed } from "../../src/ingestion/rssFeeds.js";

const feedA: RssFeed = { slug: "feed-a", url: "https://a.example.com/rss" };
const feedB: RssFeed = { slug: "feed-b", url: "https://b.example.com/rss" };
const feeds: RssFeed[] = [feedA, feedB];

describe("fetchRssCandidates", () => {
  it("maps items from every feed into candidates", async () => {
    const parseFeed: ParseFeed = async (url) => {
      if (url === feedA.url) {
        return [
          {
            title: "Story A",
            link: "https://a.example.com/1",
            isoDate: "2026-07-27T12:00:00Z",
          },
        ];
      }
      return [
        {
          title: "Story B",
          link: "https://b.example.com/1",
          pubDate: "2026-07-27T13:00:00Z",
        },
      ];
    };

    const candidates = await fetchRssCandidates(feeds, parseFeed);
    expect(candidates).toHaveLength(2);
    expect(candidates.find((c) => c.sourceSlug === "feed-a")?.headline).toBe(
      "Story A",
    );
    expect(candidates.find((c) => c.sourceSlug === "feed-b")?.headline).toBe(
      "Story B",
    );
  });

  it("skips a feed that fails without dropping the others", async () => {
    const parseFeed: ParseFeed = async (url) => {
      if (url === feedA.url) throw new Error("feed unreachable");
      return [{ title: "Story B", link: "https://b.example.com/1" }];
    };

    const candidates = await fetchRssCandidates(feeds, parseFeed);
    expect(candidates).toEqual([
      expect.objectContaining({ headline: "Story B", sourceSlug: "feed-b" }),
    ]);
  });

  it("skips items missing a title or link", async () => {
    const parseFeed: ParseFeed = async () => [
      { title: "Has both", link: "https://a.example.com/1" },
      { title: "No link" },
      { link: "https://a.example.com/2" },
    ];

    const candidates = await fetchRssCandidates([feedA], parseFeed);
    expect(candidates).toHaveLength(1);
    expect(candidates.find((c) => c.headline === "Has both")).toBeDefined();
  });

  it("falls back to now() for an unparsable date", async () => {
    const parseFeed: ParseFeed = async () => [
      {
        title: "Story",
        link: "https://a.example.com/1",
        pubDate: "not-a-date",
      },
    ];
    const before = Date.now();
    const candidates = await fetchRssCandidates([feedA], parseFeed);
    expect(
      candidates.find((c) => c.headline === "Story")?.publishedAt.getTime(),
    ).toBeGreaterThanOrEqual(before);
  });
});
