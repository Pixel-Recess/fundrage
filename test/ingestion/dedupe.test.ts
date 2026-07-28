import { describe, it, expect } from "vitest";
import { claimFingerprint } from "../../src/ingestion/dedupe.js";
import { createFakeKv } from "../helpers/fakes.js";

describe("claimFingerprint", () => {
  it("returns true the first time a fingerprint is claimed", async () => {
    const kv = createFakeKv();
    await expect(claimFingerprint(kv, "big story|example.com", 3600)).resolves.toBe(true);
  });

  it("returns false for a repeat claim within the TTL window", async () => {
    const kv = createFakeKv();
    await claimFingerprint(kv, "big story|example.com", 3600);
    await expect(claimFingerprint(kv, "big story|example.com", 3600)).resolves.toBe(false);
  });

  it("treats different fingerprints independently", async () => {
    const kv = createFakeKv();
    await claimFingerprint(kv, "story a|example.com", 3600);
    await expect(claimFingerprint(kv, "story b|example.com", 3600)).resolves.toBe(true);
  });
});
