const EVERY_ORG_BASE = "https://partners.every.org/v0.2";

export interface EveryOrgNonprofit {
  id: string;
  name: string;
  description: string;
  ein: string | null;
  logoUrl: string | null;
  profileUrl: string;
}

interface EveryOrgApiNonprofit {
  slug?: string;
  ein?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  logoCloudinaryId?: string;
  coverImageCloudinaryId?: string;
  websiteUrl?: string;
}

interface EveryOrgSearchResponse {
  nonprofits?: EveryOrgApiNonprofit[];
}

/**
 * Every.org's public Nonprofit Search API (free for non-commercial use, self-serve apiKey —
 * see https://www.every.org/charity-api). Uses free-text search rather than the cause-browse
 * endpoint since Every.org's internal cause taxonomy slugs aren't confirmed against our topic
 * list — searching by a plain-English topic label (e.g. "housing") is more robust than guessing
 * at cause-tag strings.
 */
export async function searchNonprofits(
  searchTerm: string,
  apiKey: string,
  take: number,
  fetchImpl: typeof fetch = fetch,
): Promise<EveryOrgNonprofit[]> {
  const url = new URL(
    `${EVERY_ORG_BASE}/search/${encodeURIComponent(searchTerm)}`,
  );
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("take", String(Math.min(take, 50)));

  const res = await fetchImpl(url.toString());
  if (!res.ok) {
    throw new Error(
      `Every.org request failed: ${res.status} ${res.statusText}`,
    );
  }

  const body = (await res.json()) as EveryOrgSearchResponse;
  const nonprofits = Array.isArray(body.nonprofits) ? body.nonprofits : [];

  return nonprofits
    .filter(
      (
        n,
      ): n is Required<Pick<EveryOrgApiNonprofit, "slug" | "name">> &
        EveryOrgApiNonprofit => Boolean(n.slug && n.name),
    )
    .map((n) => ({
      id: n.slug,
      name: n.name,
      description: n.description ?? "",
      ein: n.ein ?? null,
      logoUrl: n.logoUrl ?? null,
      profileUrl: `https://www.every.org/${n.slug}`,
    }));
}
