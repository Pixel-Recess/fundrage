import Fastify, { type FastifyInstance } from "fastify";
import type { Config } from "./config.js";
import type { Db, Kv } from "./types.js";
import { createAppleVerifier, type AppleIdentity } from "./auth/apple.js";
import { createSessionService } from "./auth/session.js";
import { registerIdempotency } from "./plugins/idempotency.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth.js";

export interface AppDeps {
  db: Db;
  kv: Kv;
  /** Test seam: override Apple token verification. */
  verifyAppleToken?: (token: string) => Promise<AppleIdentity>;
}

export function buildApp(config: Config, deps: AppDeps): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.env === "test" ? "silent" : "info",
      redact: ["req.headers.authorization", "req.body.identity_token"], // never log tokens
    },
  });

  const sessions = createSessionService(config.jwtSecret);
  const verifyAppleToken =
    deps.verifyAppleToken ??
    createAppleVerifier({
      bundleId: config.apple.bundleId,
      issuer: config.apple.issuer,
      jwksUrl: config.apple.jwksUrl,
    });

  registerIdempotency(app, deps.kv);
  registerHealthRoutes(app, { db: deps.db, kv: deps.kv });
  registerAuthRoutes(app, { db: deps.db, verifyAppleToken, sessions });

  return app;
}
