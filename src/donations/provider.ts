import type { FastifyRequest } from "fastify";

export interface PartnerWebhookPayload {
  chargeId: string;
  partnerDonationId: string | null;
  toNonprofit: { slug: string; ein: string; name: string };
  amount: string;
  netAmount: string;
  currency: string;
  frequency: string;
  donationDate: string;
}

/**
 * Sits between the donation service and whichever giving rail actually moves money, so the rail
 * can be swapped later (CLAUDE.md — "we never touch money... donation layer sits behind a
 * DonationProvider interface").
 */
export interface DonationProvider {
  buildDonateLink(params: {
    nonprofitSlug: string;
    partnerDonationId: string;
    amountCents?: number;
  }): string;
  /** True if the inbound webhook request is authentically from this provider. */
  verifyWebhookRequest(req: FastifyRequest): boolean;
  parseWebhookPayload(body: unknown): PartnerWebhookPayload;
}
