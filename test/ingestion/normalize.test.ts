import { describe, it, expect } from "vitest";
import { normalizeHeadline, computeFingerprint } from "../../src/ingestion/normalize.js";

describe("normalizeHeadline", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeHeadline("Wildfire Relief: Donations Surge!")).toBe(
      "wildfire relief donations surge",
    );
  });

  it("collapses repeated whitespace", () => {
    expect(normalizeHeadline("Too   many    spaces")).toBe("too many spaces");
  });

  it("treats differently-punctuated equivalent headlines as equal", () => {
    expect(normalizeHeadline("Storm hits coast — thousands flee")).toBe(
      normalizeHeadline("Storm hits coast, thousands flee."),
    );
  });
});

describe("computeFingerprint", () => {
  it("combines normalized headline and domain", () => {
    const fp = computeFingerprint("Big Story!", "https://www.example.com/a");
    expect(fp).toBe("big story|example.com");
  });

  it("strips the www. prefix so www and bare domain match", () => {
    const withWww = computeFingerprint("Big Story", "https://www.example.com/a");
    const withoutWww = computeFingerprint("Big Story", "https://example.com/b");
    expect(withWww).toBe(withoutWww);
  });

  it("differs by domain for an otherwise identical headline", () => {
    const a = computeFingerprint("Big Story", "https://example.com/a");
    const b = computeFingerprint("Big Story", "https://other.com/a");
    expect(a).not.toBe(b);
  });

  it("falls back to an empty domain for a malformed URL instead of throwing", () => {
    expect(() => computeFingerprint("Big Story", "not-a-url")).not.toThrow();
    expect(computeFingerprint("Big Story", "not-a-url")).toBe("big story|");
  });
});
