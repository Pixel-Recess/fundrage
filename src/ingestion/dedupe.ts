import type { Kv } from "../types.js";

/**
 * Atomically claims a fingerprint for the dedupe window. Returns true the
 * first time a fingerprint is seen; false for every repeat within the TTL.
 */
export async function claimFingerprint(
  kv: Kv,
  fingerprint: string,
  ttlSeconds: number,
): Promise<boolean> {
  return kv.setNx(`ingest:fp:${fingerprint}`, "1", ttlSeconds);
}
