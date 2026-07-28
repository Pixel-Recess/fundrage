import type { FastifyInstance } from "fastify";
import type { Db, Kv } from "../types.js";

export function registerHealthRoutes(
  app: FastifyInstance,
  deps: { db: Db; kv: Kv },
): void {
  // Liveness: process is up.
  app.get("/healthz", async () => ({ status: "ok" }));

  // Readiness: dependencies reachable.
  app.get("/readyz", async (req, reply) => {
    const checks: Record<string, "ok" | "failed"> = {
      postgres: "ok",
      redis: "ok",
    };
    await Promise.all([
      deps.db.ping().catch((err: unknown) => {
        checks.postgres = "failed";
        req.log.error({ err }, "readyz: postgres ping failed");
      }),
      deps.kv.ping().catch((err: unknown) => {
        checks.redis = "failed";
        req.log.error({ err }, "readyz: redis ping failed");
      }),
    ]);
    const healthy = Object.values(checks).every((c) => c === "ok");
    return reply
      .code(healthy ? 200 : 503)
      .send({ status: healthy ? "ok" : "degraded", checks });
  });
}
