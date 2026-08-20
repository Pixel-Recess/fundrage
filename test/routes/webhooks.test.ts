import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";
import { createMigratedDb } from "../helpers/pglite.js";
import { createFakeKv, testConfig } from "../helpers/fakes.js";

let db: Awaited<ReturnType<typeof createMigratedDb>>;
let app: FastifyInstance;
let donationId: string;

const AUTH_HEADER = { authorization: "Bearer test-webhook-auth-token" };

beforeAll(async () => {
  db = await createMigratedDb();
  app = buildApp(testConfig(), {
    db,
    kv: createFakeKv(),
    verifyAppleToken: async () => ({ sub: "x", email: null }),
  });
  await app.ready();
});
afterAll(async () => {
  await app.close();
  await db.close();
});

beforeEach(async () => {
  const { rows: userRows } = await db.query<{ id: string }>(
    `INSERT INTO users (apple_sub) VALUES ($1) RETURNING id`,
    [crypto.randomUUID()],
  );
  const { rows: eventRows } = await db.query<{ id: string }>(
    `INSERT INTO news_events (headline) VALUES ('Test headline') RETURNING id`,
  );
  const { rows: charityRows } = await db.query<{ id: string }>(
    `INSERT INTO charities (ein, name, everyorg_slug)
     VALUES ($1, 'Give Directly', 'givedirectly') RETURNING id`,
    [crypto.randomUUID().slice(0, 9)],
  );
  const { rows: donationRows } = await db.query<{ id: string }>(
    `INSERT INTO donations (user_id, event_id, charity_id, amount_cents)
     VALUES ($1, $2, $3, 1000) RETURNING id`,
    [userRows[0]!.id, eventRows[0]!.id, charityRows[0]!.id],
  );
  donationId = donationRows[0]!.id;
});

function payload(overrides: Partial<{ chargeId: string; partnerDonationId: string | null }> = {}) {
  return {
    chargeId: overrides.chargeId ?? crypto.randomUUID(),
    partnerDonationId:
      overrides.partnerDonationId === undefined ? donationId : overrides.partnerDonationId,
    toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
    amount: "10.00",
    netAmount: "9.70",
    currency: "USD",
    frequency: "Once",
    donationDate: "2026-08-20T12:00:00Z",
  };
}

describe("POST /webhooks/every-org", () => {
  it("confirms the matching donation on a valid authenticated request", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { ...AUTH_HEADER, "content-type": "application/json" },
      payload: payload({ chargeId: "charge-a" }),
    });
    expect(res.statusCode).toBe(200);

    const { rows } = await db.query<{ status: string; everyorg_donation_id: string | null }>(
      `SELECT status, everyorg_donation_id FROM donations WHERE id = $1`,
      [donationId],
    );
    expect(rows[0]?.status).toBe("confirmed");
    expect(rows[0]?.everyorg_donation_id).toBe("charge-a");
  });

  it("rejects a request with no Authorization header, leaving the donation untouched", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { "content-type": "application/json" },
      payload: payload({ chargeId: "charge-b" }),
    });
    expect(res.statusCode).toBe(401);

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM donations WHERE id = $1`,
      [donationId],
    );
    expect(rows[0]?.status).toBe("initiated");
  });

  it("rejects a request with the wrong Authorization token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { authorization: "Bearer wrong-token", "content-type": "application/json" },
      payload: payload({ chargeId: "charge-c" }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("is idempotent when the same request is replayed", async () => {
    const body = payload({ chargeId: "charge-d" });
    const first = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { ...AUTH_HEADER, "content-type": "application/json" },
      payload: body,
    });
    const second = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { ...AUTH_HEADER, "content-type": "application/json" },
      payload: body,
    });
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM donations WHERE id = $1`,
      [donationId],
    );
    expect(rows[0]?.status).toBe("confirmed");
  });

  it("returns 200 for an authenticated request whose partnerDonationId doesn't match any donation", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { ...AUTH_HEADER, "content-type": "application/json" },
      payload: payload({ chargeId: "charge-e", partnerDonationId: crypto.randomUUID() }),
    });
    expect(res.statusCode).toBe(200);
  });

  it("returns 400 for a malformed payload", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/every-org",
      headers: { ...AUTH_HEADER, "content-type": "application/json" },
      payload: { not: "a valid payload" },
    });
    expect(res.statusCode).toBe(400);
  });
});
