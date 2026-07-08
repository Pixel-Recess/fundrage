import { describe, it, expect, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { createFakeKv, testConfig } from "./helpers/fakes.js";
import type { Db } from "../src/types.js";

let app: FastifyInstance;
afterEach(async () => app.close());

function fakeDb(failPing = false): Db {
  return {
    async query() {
      return { rows: [] };
    },
    async ping() {
      if (failPing) throw new Error("pg down");
    },
  };
}

async function build(dbFails = false, redisFails = false) {
  const kv = createFakeKv();
  kv.failPing = redisFails;
  app = buildApp(testConfig(), {
    db: fakeDb(dbFails),
    kv,
    verifyAppleToken: async () => ({ sub: "x", email: null }),
  });
  await app.ready();
}

describe("health endpoints", () => {
  it("GET /healthz is always ok while the process is up", async () => {
    await build();
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("GET /readyz is 200 when Postgres and Redis respond", async () => {
    await build();
    const res = await app.inject({ method: "GET", url: "/readyz" });
    expect(res.statusCode).toBe(200);
    expect(res.json().checks).toEqual({ postgres: "ok", redis: "ok" });
  });

  it("GET /readyz is 503 when Postgres is down", async () => {
    await build(true, false);
    const res = await app.inject({ method: "GET", url: "/readyz" });
    expect(res.statusCode).toBe(503);
    expect(res.json().checks.postgres).toBe("failed");
  });

  it("GET /readyz is 503 when Redis is down", async () => {
    await build(false, true);
    const res = await app.inject({ method: "GET", url: "/readyz" });
    expect(res.statusCode).toBe(503);
    expect(res.json().checks.redis).toBe("failed");
  });
});
