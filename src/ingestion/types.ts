export interface NewsCandidate {
  headline: string;
  canonicalUrl: string;
  sourceSlug: string;
  publishedAt: Date;
  /** Short snippet, when the source feed provides one (RSS only — GDELT has no equivalent). */
  summary?: string | undefined;
  /** Thumbnail image, when the source feed provides one (RSS only — GDELT has no equivalent). */
  imageUrl?: string | undefined;
}
