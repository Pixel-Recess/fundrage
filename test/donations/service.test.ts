import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createMigratedDb } from "../helpers/pglite.js";
import { createDonationService } from "../../src/donations/service.js";
import { createEveryOrgProvider } from "../../src/donations/everyOrgProvider.js";

let db: Awaited<ReturnType<typeof createMigratedDb>>;
let userId: string;
let eventId: string;
let charityId: string;

const provider = createEveryOrgProvider({
  baseUrl: "https://staging.every.org",
  webhookToken: "wtoken-123",
  webhookAuthToken: "secret-auth-token",
});
const service = () => createDonationService(db, provider);

beforeAll(async () => {
  db = await createMigratedDb();
});
afterAll(async () => db.close());

beforeEach(async () => {
  const { rows: userRows } = await db.query<{ id: string }>(
    `INSERT INTO users (apple_sub) VALUES ($1) RETURNING id`,
    [crypto.randomUUID()],
  );
  userId = userRows[0]!.id;

  const { rows: eventRows } = await db.query<{ id: string }>(
    `INSERT INTO news_events (headline) VALUES ('Test headline') RETURNING id`,
  );
  eventId = eventRows[0]!.id;

  const { rows: charityRows } = await db.query<{ id: string }>(
    `INSERT INTO charities (ein, name, everyorg_slug)
     VALUES ($1, 'Give Directly', 'givedirectly') RETURNING id`,
    [crypto.randomUUID().slice(0, 9)],
  );
  charityId = charityRows[0]!.id;
});

describe("initiate", () => {
  it("inserts a donation row with status 'initiated' and returns a donate link", async () => {
    const { donationId, donateLink } = await service().initiate({
      userId,
      eventId,
      charityId,
      amountCents: 1000,
    });

    expect(donateLink).toContain(`partner_donation_id=${donationId}`);
    const { rows } = await db.query<{ status: string; amount_cents: number }>(
      `SELECT status, amount_cents FROM donations WHERE id = $1`,
      [donationId],
    );
    expect(rows[0]).toEqual({ status: "initiated", amount_cents: 1000 });
  });

  it("throws when the charity has no everyorg_slug", async () => {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO charities (ein, name) VALUES ($1, 'No Slug Org') RETURNING id`,
      [crypto.randomUUID().slice(0, 9)],
    );
    await expect(
      service().initiate({
        userId,
        eventId,
        charityId: rows[0]!.id,
        amountCents: 1000,
      }),
    ).rejects.toThrow();
  });
});

describe("confirmFromWebhook", () => {
  it("transitions a donation to confirmed and stores the charge id", async () => {
    const { donationId } = await service().initiate({
      userId,
      eventId,
      charityId,
      amountCents: 1000,
    });

    const result = await service().confirmFromWebhook({
      chargeId: "charge-1",
      partnerDonationId: donationId,
      toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
      amount: "10.00",
      netAmount: "9.70",
      currency: "USD",
      frequency: "Once",
      donationDate: "2026-08-20T12:00:00Z",
    });
    expect(result.handled).toBe(true);

    const { rows } = await db.query<{
      status: string;
      everyorg_donation_id: string | null;
      confirmed_at: string | null;
    }>(
      `SELECT status, everyorg_donation_id, confirmed_at FROM donations WHERE id = $1`,
      [donationId],
    );
    expect(rows[0]?.status).toBe("confirmed");
    expect(rows[0]?.everyorg_donation_id).toBe("charge-1");
    expect(rows[0]?.confirmed_at).not.toBeNull();
  });

  it("is idempotent when called twice with the same payload", async () => {
    const { donationId } = await service().initiate({
      userId,
      eventId,
      charityId,
      amountCents: 1000,
    });
    const payload = {
      chargeId: "charge-2",
      partnerDonationId: donationId,
      toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
      amount: "10.00",
      netAmount: "9.70",
      currency: "USD",
      frequency: "Once",
      donationDate: "2026-08-20T12:00:00Z",
    };

    const first = await service().confirmFromWebhook(payload);
    const second = await service().confirmFromWebhook(payload);
    expect(first.handled).toBe(true);
    expect(second.handled).toBe(true);

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM donations WHERE id = $1`,
      [donationId],
    );
    expect(rows[0]?.status).toBe("confirmed");
  });

  it("handles an unknown partnerDonationId gracefully", async () => {
    const result = await service().confirmFromWebhook({
      chargeId: "charge-3",
      partnerDonationId: crypto.randomUUID(),
      toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
      amount: "10.00",
      netAmount: "9.70",
      currency: "USD",
      frequency: "Once",
      donationDate: "2026-08-20T12:00:00Z",
    });
    expect(result.handled).toBe(false);
  });

  it("handles a null partnerDonationId gracefully", async () => {
    const result = await service().confirmFromWebhook({
      chargeId: "charge-4",
      partnerDonationId: null,
      toNonprofit: { slug: "givedirectly", ein: "271661997", name: "Give Directly" },
      amount: "10.00",
      netAmount: "9.70",
      currency: "USD",
      frequency: "Once",
      donationDate: "2026-08-20T12:00:00Z",
    });
    expect(result.handled).toBe(false);
  });
});
