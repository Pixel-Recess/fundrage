import type { FastifyInstance } from "fastify";
import type { DonationProvider } from "../donations/provider.js";
import type { DonationService } from "../donations/service.js";

export interface WebhookRoutesDeps {
  provider: DonationProvider;
  donationService: DonationService;
}

export function registerWebhookRoutes(
  app: FastifyInstance,
  deps: WebhookRoutesDeps,
): void {
  // Idempotency-Key isn't applicable here — Every.org doesn't send one, and replay protection
  // is handled by the donation status check + the everyorg_donation_id unique constraint.
  app.post(
    "/webhooks/every-org",
    { config: { idempotency: false } },
    async (req, reply) => {
      if (!deps.provider.verifyWebhookRequest(req)) {
        return reply.code(401).send({ error: "invalid_webhook_auth" });
      }

      let payload;
      try {
        payload = deps.provider.parseWebhookPayload(req.body);
      } catch (err) {
        req.log.warn({ err }, "webhooks/every-org: malformed payload");
        return reply.code(400).send({ error: "malformed_payload" });
      }

      const result = await deps.donationService.confirmFromWebhook(payload);
      if (!result.handled) {
        req.log.warn(
          { chargeId: payload.chargeId },
          "webhooks/every-org: no matching donation for this charge",
        );
      }
      // Always 200 on an authenticated, structurally valid request so Every.org doesn't retry.
      return reply.code(200).send({ ok: true });
    },
  );
}
