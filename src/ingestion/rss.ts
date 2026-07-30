import Parser from "rss-parser";
import { logger } from "../logger.js";
import type { NewsCandidate } from "./types.js";
import type { RssFeed } from "./rssFeeds.js";

export interface RssItem {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  /** rss-parser exposes whichever of these the source feed provides — checked in order. */
  contentSnippet?: string;
  summary?: string;
  content?: string;
  /** Standard RSS 2.0 media attachment — most reliable image source when present. */
  enclosure?: { url?: string };
  /** media:content / media:thumbnail (Media RSS extension) — common on news feeds that don't
   * use <enclosure> for images. Parsed via rss-parser's customFields option below. Some feeds
   * (e.g. the Guardian) repeat media:content once per available size (140/460/700px, etc.) —
   * keepArray ensures all of them are captured, not just the first (smallest). */
  mediaContent?: { $?: { url?: string; width?: string } }[];
  mediaThumbnail?: { $?: { url?: string } };
}

export type ParseFeed = (url: string) => Promise<RssItem[]>;

const defaultParser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

async function defaultParseFeed(url: string): Promise<RssItem[]> {
  const feed = await defaultParser.parseURL(url);
  return feed.items;
}

function parseItemDate(item: RssItem): Date {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return new Date();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** Some feeds put raw HTML in contentSnippet/summary/content — strip tags and trim length. */
function parseItemSummary(item: RssItem): string | undefined {
  const raw = item.contentSnippet ?? item.summary ?? item.content;
  if (!raw) return undefined;
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > 280 ? `${text.slice(0, 280).trimEnd()}…` : text;
}

/**
 * Checks <enclosure>, then the largest media:content by width (feeds like the Guardian list
 * several sizes — the first one isn't necessarily the biggest), then media:thumbnail.
 */
function parseItemImage(item: RssItem): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  const mediaList = item.mediaContent ?? [];
  const largest = mediaList.reduce<
    { $?: { url?: string; width?: string } } | undefined
  >((best, current) => {
    const bestWidth = Number(best?.$?.width ?? -1);
    const currentWidth = Number(current?.$?.width ?? -1);
    return currentWidth > bestWidth ? current : best;
  }, undefined);
  if (largest?.$?.url) return largest.$.url;
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  return undefined;
}

/**
 * Polls the curated RSS list. Each feed is fetched independently — one feed
 * failing (down, malformed, timeout) doesn't drop the others. `parseFeed` is
 * injectable so tests never hit real feeds.
 */
export async function fetchRssCandidates(
  feeds: RssFeed[],
  parseFeed: ParseFeed = defaultParseFeed,
): Promise<NewsCandidate[]> {
  const results = await Promise.allSettled(
    feeds.map(async (feed) => ({ feed, items: await parseFeed(feed.url) })),
  );

  const candidates: NewsCandidate[] = [];
  for (const result of results) {
    if (result.status === "rejected") {
      logger.error({ err: result.reason }, "RSS feed failed");
      continue;
    }
    const { feed, items } = result.value;
    for (const item of items) {
      if (!item.title || !item.link) continue;
      candidates.push({
        headline: item.title,
        canonicalUrl: item.link,
        sourceSlug: feed.slug,
        publishedAt: parseItemDate(item),
        summary: parseItemSummary(item),
        imageUrl: parseItemImage(item),
      });
    }
  }
  return candidates;
}
