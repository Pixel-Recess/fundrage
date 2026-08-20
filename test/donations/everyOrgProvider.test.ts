import { describe, it, expect, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { createEveryOrgProvider } from "../../src/donations/everyOrgProvider.js";

const provider = createEveryOrgProvider({
  baseUrl: "https://staging.every.org",
  webhookToken: "wtoken-123",
  webhookAuthToken: "secret-auth-token",
});

describe("buildDonateLink", () => {
  it("builds a donate link with partner_donation_id and webhook_token", () => {
    const link = provider.buildDonateLink({
      nonprofitSlug: "givedirectly",
      partnerDonationId: "donation-1",
    });
    expect(link).toBe(
      "https://staging.every.org/givedirectly?partner_donation_id=donation-1&webhook_token=wtoken-123#donate",
    );
  });

  it("includes amount in dollars when amountCents is given", () => {
    const link = provider.buildDonateLink({
      nonprofitSlug: "givedirectly",
      partnerDonationId: "donation-1",
      amountCents: 1500,
    });
    expect(link).toContain("amount=15");
  });
});

describe("parseWebhookPayload", () => {
  it("parses a well-formed payload", () => {
    const payload = provider.parseWebhookPayload({
      chargeId: "charge-1",
      partnerDonationId: "donation-1",
      toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
      amount: "10.00",
      netAmount: "9.70",
      currency: "USD",
      frequency: "Once",
      donationDate: "2026-08-20T12:00:00Z",
    });
    expect(payload.chargeId).toBe("charge-1");
    expect(payload.partnerDonationId).toBe("donation-1");
    expect(payload.toNonprofit).toEqual({
      slug: "givedirectly",
      ein: "271661997",
      name: "Give Directly",
    });
  });

  it("treats a missing partnerDonationId as null rather than throwing", () => {
    const payload = provider.parseWebhookPayload({
      chargeId: "charge-1",
      toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
    });
    expect(payload.partnerDonationId).toBeNull();
  });

  it("throws on a payload missing chargeId", () => {
    expect(() => provider.parseWebhookPayload({})).toThrow();
  });

  it("throws on a payload missing toNonprofit", () => {
    expect(() => provider.parseWebhookPayload({ chargeId: "charge-1" })).toThrow();
  });
});

describe("verifyWebhookRequest", () => {
  let app: FastifyInstance;
  afterEach(async () => app.close());

  async function build() {
    app = Fastify({ logger: false });
    app.post("/hook", async (req) => ({
      valid: provider.verifyWebhookRequest(req),
    }));
    await app.ready();
  }

  it("accepts a correct Bearer auth token", async () => {
    await build();
    const res = await app.inject({
      method: "POST",
      url: "/hook",
      headers: { authorization: "Bearer secret-auth-token" },
    });
    expect(res.json().valid).toBe(true);
  });

  it("rejects a missing Authorization header", async () => {
    await build();
    const res = await app.inject({ method: "POST", url: "/hook" });
    expect(res.json().valid).toBe(false);
  });

  it("rejects the wrong token", async () => {
    await build();
    const res = await app.inject({
      method: "POST",
      url: "/hook",
      headers: { authorization: "Bearer wrong-token" },
    });
    expect(res.json().valid).toBe(false);
  });

  it("rejects a non-Bearer scheme", async () => {
    await build();
    const res = await app.inject({
      method: "POST",
      url: "/hook",
      headers: { authorization: "Basic secret-auth-token" },
    });
    expect(res.json().valid).toBe(false);
  });
});
