import type { NewsCandidate } from "./types.js";

const GDELT_DOC_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";

interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

/** GDELT seendate looks like "20260727T120000Z". */
function parseGdeltDate(seendate: string | undefined): Date {
  if (!seendate) return new Date();
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seendate);
  if (!match) return new Date();
  const [, year, month, day, hour, minute, second] = match;
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );
}

/**
 * Polls GDELT's DOC 2.0 API (open, no key required — spec §7) for recent
 * articles matching `query`. `fetchImpl` is injectable so tests never hit
 * the real network.
 */
export async function fetchGdeltCandidates(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NewsCandidate[]> {
  const url = new URL(GDELT_DOC_ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "DateDesc");
  url.searchParams.set("maxrecords", "75");

  const res = await fetchImpl(url.toString());
  if (!res.ok) {
    throw new Error(`GDELT request failed: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as GdeltResponse;
  const articles = Array.isArray(body.articles) ? body.articles : [];

  return articles
    .filter((article): article is Required<Pick<GdeltArticle, "url" | "title" | "domain">> & GdeltArticle =>
      Boolean(article.url && article.title && article.domain),
    )
    .map((article) => ({
      headline: article.title,
      canonicalUrl: article.url,
      sourceSlug: article.domain,
      publishedAt: parseGdeltDate(article.seendate),
    }));
}
