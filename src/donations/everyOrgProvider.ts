import { timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import type { DonationProvider, PartnerWebhookPayload } from "./provider.js";

export interface EveryOrgConfig {
  baseUrl: string;
  webhookToken: string;
  webhookAuthToken: string;
}

/** Constant-time string compare — safe even when lengths differ (timingSafeEqual alone throws). */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Every.org Donate Links + Partner Webhook, per docs.every.org.
 *
 * `verifyWebhookRequest` is a documented gap: Every.org's webhook payload carries no signature
 * or token of any kind, and the only secret their dashboard issues beyond the link-embedded
 * Webhook Token is a JWT-shaped "Auth Token" with no documented use. This checks it as a bearer
 * `Authorization` header — the standard shape for a secret like that — but it is UNCONFIRMED
 * against Every.org (see Phase 1 plan). Do not trust this route with production traffic until
 * that's confirmed with Every.org support.
 */
export function createEveryOrgProvider(
  config: EveryOrgConfig,
): DonationProvider {
  return {
    buildDonateLink({ nonprofitSlug, partnerDonationId, amountCents }) {
      const params = new URLSearchParams({
        partner_donation_id: partnerDonationId,
        webhook_token: config.webhookToken,
      });
      if (amountCents !== undefined) {
        params.set("amount", (amountCents / 100).toString());
      }
      return `${config.baseUrl}/${nonprofitSlug}?${params.toString()}#donate`;
    },

    verifyWebhookRequest(req: FastifyRequest) {
      const header = req.headers.authorization;
      if (typeof header !== "string") return false;
      const [scheme, token] = header.split(" ");
      if (scheme !== "Bearer" || !token) return false;
      return safeEqual(token, config.webhookAuthToken);
    },

    parseWebhookPayload(body: unknown): PartnerWebhookPayload {
      if (typeof body !== "object" || body === null) {
        throw new Error("webhook payload must be a JSON object");
      }
      const b = body as Record<string, unknown>;
      if (typeof b.chargeId !== "string") {
        throw new Error("webhook payload missing chargeId");
      }
      const toNonprofit = b.toNonprofit as Record<string, unknown> | undefined;
      if (
        typeof toNonprofit !== "object" ||
        toNonprofit === null ||
        typeof toNonprofit.slug !== "string" ||
        typeof toNonprofit.ein !== "string" ||
        typeof toNonprofit.name !== "string"
      ) {
        throw new Error("webhook payload missing toNonprofit");
      }
      return {
        chargeId: b.chargeId,
        partnerDonationId:
          typeof b.partnerDonationId === "string" ? b.partnerDonationId : null,
        toNonprofit: {
          slug: toNonprofit.slug,
          ein: toNonprofit.ein,
          name: toNonprofit.name,
        },
        amount: String(b.amount ?? ""),
        netAmount: String(b.netAmount ?? ""),
        currency: String(b.currency ?? ""),
        frequency: String(b.frequency ?? ""),
        donationDate: String(b.donationDate ?? ""),
      };
    },
  };
}
