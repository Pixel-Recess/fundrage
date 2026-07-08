import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Kv } from '../types.js';

const TTL_SECONDS = 24 * 60 * 60;
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

interface CachedResponse {
  statusCode: number;
  body: string;
}

/**
 * Idempotency-Key support for all write endpoints (working rule: every
 * write endpoint is idempotent via this header).
 *
 * - Mutating requests MUST carry an Idempotency-Key header (400 otherwise).
 * - First request executes and its response is cached for 24h.
 * - Replays with the same key return the cached response.
 * - A key that is still in-flight returns 409.
 *
 * Routes can opt out (e.g. webhooks, which have their own replay
 * protection) with `config: { idempotency: false }`.
 */
export function registerIdempotency(app: FastifyInstance, kv: Kv): void {
  app.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!MUTATING.has(req.method)) return;
    const routeConfig = req.routeOptions.config as { idempotency?: boolean } | undefined;
    if (routeConfig?.idempotency === false) return;

    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || key.length < 1 || key.length > 255) {
      return reply.code(400).send({ error: 'missing_idempotency_key' });
    }

    const storageKey = `idem:${req.method}:${req.url}:${key}`;
    const claimed = await kv.setNx(storageKey, 'pending', TTL_SECONDS);
    if (claimed) {
      // First time we see this key — execute, then cache the response.
      reply.raw.setHeader('idempotency-status', 'original');
      req.idempotencyStorageKey = storageKey;
      return;
    }
    const cached = await kv.get(storageKey);
    if (cached === 'pending') {
      return reply.code(409).send({ error: 'request_in_flight' });
    }
    if (cached) {
      const parsed = JSON.parse(cached) as CachedResponse;
      return reply
        .code(parsed.statusCode)
        .header('idempotency-status', 'replayed')
        .type('application/json')
        .send(parsed.body);
    }
  });

  app.addHook('onSend', async (req, reply, payload) => {
    const storageKey = req.idempotencyStorageKey;
    if (storageKey && typeof payload === 'string') {
      const cached: CachedResponse = { statusCode: reply.statusCode, body: payload };
      await kv.set(storageKey, JSON.stringify(cached), TTL_SECONDS);
    }
    return payload;
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    idempotencyStorageKey?: string;
  }
}
