/**
 * Client for the backend's experimental /dev/* routes — real news/charity data, no
 * persistence, no auth. See the backend's src/routes/live.ts for what these actually do.
 * VITE_API_BASE_URL points at the Render backend; unset in any environment where the demo
 * should stay fully mocked (every call site here falls back to local mock data on failure).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export interface LiveArticle {
  headline: string;
  summary: string;
  canonicalUrl: string;
  sourceSlug: string;
  publishedAt: string;
  imageUrl: string | null;
  matchedTopics: string[];
}

export interface LiveNonprofit {
  id: string;
  name: string;
  description: string;
  ein: string | null;
  logoUrl: string | null;
  profileUrl: string;
}

export async function fetchLiveNews(topicIds: string[]): Promise<LiveArticle[]> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not configured');
  const url = new URL('/dev/news', API_BASE_URL);
  if (topicIds.length > 0) url.searchParams.set('topics', topicIds.join(','));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Live news request failed: ${res.status}`);
  const body = (await res.json()) as { articles?: LiveArticle[] };
  return body.articles ?? [];
}

export async function fetchLiveCharities(topicId: string): Promise<LiveNonprofit[]> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not configured');
  const url = new URL('/dev/charities', API_BASE_URL);
  url.searchParams.set('topic', topicId);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Live charities request failed: ${res.status}`);
  const body = (await res.json()) as { nonprofits?: LiveNonprofit[] };
  return body.nonprofits ?? [];
}
