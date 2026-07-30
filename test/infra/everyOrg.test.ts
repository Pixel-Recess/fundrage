import { describe, it, expect } from "vitest";
import { searchNonprofits } from "../../src/infra/everyOrg.js";

function fakeFetch(response: Partial<Response>): typeof fetch {
  return (async () => response as Response) as typeof fetch;
}

describe("searchNonprofits", () => {
  it("maps Every.org nonprofits into our shape", async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: async () => ({
        nonprofits: [
          {
            slug: "coastal-paws-rescue",
            name: "Coastal Paws Rescue",
            ein: "12-3456789",
            description: "Emergency shelter for animals.",
            logoUrl: "https://example.com/logo.png",
          },
        ],
      }),
    });

    const nonprofits = await searchNonprofits(
      "animal welfare",
      "test-key",
      10,
      fetchImpl,
    );
    expect(nonprofits).toEqual([
      {
        id: "coastal-paws-rescue",
        name: "Coastal Paws Rescue",
        ein: "12-3456789",
        description: "Emergency shelter for animals.",
        logoUrl: "https://example.com/logo.png",
        profileUrl: "https://www.every.org/coastal-paws-rescue",
      },
    ]);
  });

  it("skips nonprofits missing a slug or name", async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: async () => ({
        nonprofits: [{ slug: "no-name" }, { name: "No Slug" }],
      }),
    });
    await expect(
      searchNonprofits("housing", "test-key", 10, fetchImpl),
    ).resolves.toEqual([]);
  });

  it("tolerates a response with no nonprofits field", async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({}) });
    await expect(
      searchNonprofits("housing", "test-key", 10, fetchImpl),
    ).resolves.toEqual([]);
  });

  it("throws on a non-OK response", async () => {
    const fetchImpl = fakeFetch({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });
    await expect(
      searchNonprofits("housing", "bad-key", 10, fetchImpl),
    ).rejects.toThrow(/401/);
  });

  it("caps take at 50", async () => {
    let requestedUrl = "";
    const fetchImpl = (async (url: string | URL) => {
      requestedUrl = url.toString();
      return { ok: true, json: async () => ({ nonprofits: [] }) } as Response;
    }) as typeof fetch;

    await searchNonprofits("housing", "test-key", 500, fetchImpl);
    expect(new URL(requestedUrl).searchParams.get("take")).toBe("50");
  });
});
