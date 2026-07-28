/** Lowercase, strip punctuation, and collapse whitespace for fingerprint matching. */
export function normalizeHeadline(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Dedupe key per spec §4.1: "Redis fingerprint on normalized headline + domain cluster."
 */
export function computeFingerprint(
  headline: string,
  canonicalUrl: string,
): string {
  let domain = "";
  try {
    domain = new URL(canonicalUrl).hostname.replace(/^www\./, "");
  } catch {
    // Malformed URL — fall back to headline-only fingerprint rather than throwing.
  }
  return `${normalizeHeadline(headline)}|${domain}`;
}
