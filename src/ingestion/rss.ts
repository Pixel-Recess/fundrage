import Parser from "rss-parser";
import { logger } from "../logger.js";
import type { NewsCandidate } from "./types.js";
import type { RssFeed } from "./rssFeeds.js";

export interface RssItem {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
}

export type ParseFeed = (url: string) => Promise<RssItem[]>;

const defaultParser = new Parser();

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
      });
    }
  }
  return candidates;
}
