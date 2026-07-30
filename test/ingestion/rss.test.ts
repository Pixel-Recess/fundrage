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

  it("prefers contentSnippet, then summary, then content for the summary field", async () => {
    const parseFeed: ParseFeed = async () => [
      {
        title: "A",
        link: "https://a.example.com/1",
        contentSnippet: "from snippet",
        summary: "from summary",
        content: "from content",
      },
      {
        title: "B",
        link: "https://a.example.com/2",
        summary: "from summary",
        content: "from content",
      },
      { title: "C", link: "https://a.example.com/3", content: "from content" },
    ];
    const candidates = await fetchRssCandidates([feedA], parseFeed);
    expect(candidates.find((c) => c.headline === "A")?.summary).toBe(
      "from snippet",
    );
    expect(candidates.find((c) => c.headline === "B")?.summary).toBe(
      "from summary",
    );
    expect(candidates.find((c) => c.headline === "C")?.summary).toBe(
      "from content",
    );
  });

  it("strips HTML tags and truncates a long summary", async () => {
    const parseFeed: ParseFeed = async () => [
      {
        title: "A",
        link: "https://a.example.com/1",
        contentSnippet: `<p>${"word ".repeat(100)}</p>`,
      },
    ];
    const candidates = await fetchRssCandidates([feedA], parseFeed);
    const summary = candidates[0]?.summary ?? "";
    expect(summary).not.toContain("<p>");
    expect(summary.length).toBeLessThanOrEqual(281);
    expect(summary.endsWith("…")).toBe(true);
  });

  it("leaves summary undefined when the feed provides none", async () => {
    const parseFeed: ParseFeed = async () => [
      { title: "A", link: "https://a.example.com/1" },
    ];
    const candidates = await fetchRssCandidates([feedA], parseFeed);
    expect(candidates[0]?.summary).toBeUndefined();
  });

  it("prefers enclosure, then media:content, then media:thumbnail for the image", async () => {
    const parseFeed: ParseFeed = async () => [
      {
        title: "A",
        link: "https://a.example.com/1",
        enclosure: { url: "https://a.example.com/enclosure.jpg" },
        mediaContent: [
          {
            $: { url: "https://a.example.com/media-content.jpg", width: "700" },
          },
        ],
        mediaThumbnail: { $: { url: "https://a.example.com/media-thumb.jpg" } },
      },
      {
        title: "B",
        link: "https://a.example.com/2",
        mediaContent: [
          {
            $: { url: "https://a.example.com/media-content.jpg", width: "700" },
          },
        ],
        mediaThumbnail: { $: { url: "https://a.example.com/media-thumb.jpg" } },
      },
      {
        title: "C",
        link: "https://a.example.com/3",
        mediaThumbnail: { $: { url: "https://a.example.com/media-thumb.jpg" } },
      },
      { title: "D", link: "https://a.example.com/4" },
    ];
    const candidates = await fetchRssCandidates([feedA], parseFeed);
    expect(candidates.find((c) => c.headline === "A")?.imageUrl).toBe(
      "https://a.example.com/enclosure.jpg",
    );
    expect(candidates.find((c) => c.headline === "B")?.imageUrl).toBe(
      "https://a.example.com/media-content.jpg",
    );
    expect(candidates.find((c) => c.headline === "C")?.imageUrl).toBe(
      "https://a.example.com/media-thumb.jpg",
    );
    expect(
      candidates.find((c) => c.headline === "D")?.imageUrl,
    ).toBeUndefined();
  });

  it("picks the largest media:content by width when a feed lists several sizes", async () => {
    const parseFeed: ParseFeed = async () => [
      {
        title: "A",
        link: "https://a.example.com/1",
        mediaContent: [
          { $: { url: "https://a.example.com/w140.jpg", width: "140" } },
          { $: { url: "https://a.example.com/w700.jpg", width: "700" } },
          { $: { url: "https://a.example.com/w460.jpg", width: "460" } },
        ],
      },
    ];
    const candidates = await fetchRssCandidates([feedA], parseFeed);
    expect(candidates[0]?.imageUrl).toBe("https://a.example.com/w700.jpg");
  });
});
