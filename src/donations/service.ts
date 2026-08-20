import type { Db, CharityRow, DonationRow } from "../types.js";
import type { DonationProvider, PartnerWebhookPayload } from "./provider.js";

export interface InitiateParams {
  userId: string;
  eventId: string;
  charityId: string;
  pushId?: string | undefined;
  amountCents: number;
}

export interface DonationService {
  initiate(params: InitiateParams): Promise<{ donationId: string; donateLink: string }>;
  confirmFromWebhook(
    payload: PartnerWebhookPayload,
  ): Promise<{ handled: boolean }>;
}

export function createDonationService(
  db: Db,
  provider: DonationProvider,
): DonationService {
  return {
    async initiate({ userId, eventId, charityId, pushId, amountCents }) {
      const { rows: charityRows } = await db.query<CharityRow>(
        `SELECT id, everyorg_slug FROM charities WHERE id = $1`,
        [charityId],
      );
      const charity = charityRows[0];
      if (!charity?.everyorg_slug) {
        throw new Error(`charity ${charityId} has no everyorg_slug configured`);
      }

      const { rows } = await db.query<{ id: string }>(
        `INSERT INTO donations (user_id, event_id, charity_id, push_id, amount_cents)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, eventId, charityId, pushId ?? null, amountCents],
      );
      const donation = rows[0];
      if (!donation) {
        throw new Error("donation insert failed");
      }

      const donateLink = provider.buildDonateLink({
        nonprofitSlug: charity.everyorg_slug,
        partnerDonationId: donation.id,
        amountCents,
      });
      return { donationId: donation.id, donateLink };
    },

    async confirmFromWebhook(payload: PartnerWebhookPayload) {
      if (!payload.partnerDonationId) {
        return { handled: false };
      }
      const { rows } = await db.query<DonationRow>(
        `SELECT id, status, amount_cents, everyorg_donation_id
         FROM donations WHERE id = $1`,
        [payload.partnerDonationId],
      );
      const donation = rows[0];
      if (!donation) {
        return { handled: false };
      }
      if (donation.status === "confirmed") {
        return { handled: true };
      }

      await db.query(
        `UPDATE donations
         SET status = 'confirmed', everyorg_donation_id = $2, confirmed_at = now()
         WHERE id = $1`,
        [donation.id, payload.chargeId],
      );
      return { handled: true };
    },
  };
}
