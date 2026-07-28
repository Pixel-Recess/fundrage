import type { Config } from "../config.js";
import type { Db, Kv } from "../types.js";
import type { Queue } from "../infra/queue.js";
import { logger } from "../logger.js";
import type { NewsCandidate } from "./types.js";
import { fetchGdeltCandidates } from "./gdelt.js";
import { fetchRssCandidates } from "./rss.js";
import { RSS_FEEDS } from "./rssFeeds.js";
import { computeFingerprint } from "./normalize.js";
import { claimFingerprint } from "./dedupe.js";

export interface IngestionDeps {
  db: Db;
  kv: Kv;
  queue: Queue;
  config: Config;
  /** Test seam: override the GDELT fetcher. */
  fetchGdelt?: (query: string) => Promise<NewsCandidate[]>;
  /** Test seam: override the RSS fetcher. */
  fetchRss?: () => Promise<NewsCandidate[]>;
}

export interface IngestionResult {
  inserted: number;
  skipped: number;
}

/**
 * Ingestion Service (spec §4.1): poll GDELT + curated RSS, normalize, dedupe
 * against Redis fingerprints, upsert news_events candidates, emit
 * event.detected jobs. NewsAPI is intentionally excluded (project-context.md
 * decision #7 — GDELT + RSS only, NewsAPI's production tier is too costly).
 */
export async function runIngestion(deps: IngestionDeps): Promise<IngestionResult> {
  const fetchGdelt = deps.fetchGdelt ?? ((query: string) => fetchGdeltCandidates(query));
  const fetchRss = deps.fetchRss ?? (() => fetchRssCandidates(RSS_FEEDS));

  const [gdeltResult, rssResult] = await Promise.allSettled([
    fetchGdelt(deps.config.ingestion.gdeltQuery),
    fetchRss(),
  ]);

  const candidates: NewsCandidate[] = [];
  if (gdeltResult.status === "fulfilled") {
    candidates.push(...gdeltResult.value);
  } else {
    logger.error({ err: gdeltResult.reason }, "GDELT ingestion failed");
  }
  if (rssResult.status === "fulfilled") {
    candidates.push(...rssResult.value);
  } else {
    logger.error({ err: rssResult.reason }, "RSS ingestion failed");
  }

  const ttlSeconds = deps.config.ingestion.dedupeTtlHours * 3600;
  let inserted = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const fingerprint = computeFingerprint(candidate.headline, candidate.canonicalUrl);
    const claimed = await claimFingerprint(deps.kv, fingerprint, ttlSeconds);
    if (!claimed) {
      skipped++;
      continue;
    }

    const { rows } = await deps.db.query<{ id: string }>(
      `INSERT INTO news_events (headline, canonical_url, source_slugs, status)
       VALUES ($1, $2, $3, 'detected')
       RETURNING id`,
      [candidate.headline, candidate.canonicalUrl, [candidate.sourceSlug]],
    );
    const eventId = rows[0]?.id;
    if (!eventId) {
      skipped++;
      continue;
    }

    await deps.queue.addJob("event.detected", { eventId });
    inserted++;
  }

  return { inserted, skipped };
}
