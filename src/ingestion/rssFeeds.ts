export interface RssFeed {
  slug: string;
  url: string;
}

/**
 * Curated starter list (spec §4.1: "curated RSS list"). Adjust/expand as
 * ingestion coverage is tuned — these are a reasonable, stable starting set,
 * not a final editorial decision.
 */
export const RSS_FEEDS: RssFeed[] = [
  { slug: "nyt", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
  { slug: "bbc", url: "http://feeds.bbci.co.uk/news/rss.xml" },
  { slug: "npr", url: "https://feeds.npr.org/1001/rss.xml" },
  { slug: "guardian", url: "https://www.theguardian.com/world/rss" },
];
