import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { registerIdempotency } from "../src/plugins/idempotency.js";
import { createFakeKv } from "./helpers/fakes.js";

let app: FastifyInstance;
let kv: ReturnType<typeof createFakeKv>;
let counter = 0;

beforeAll(async () => {
  kv = createFakeKv();
  app = Fastify({ logger: false });
  registerIdempotency(app, kv);
  app.post("/write", async () => ({ n: ++counter }));
  app.post("/webhook", { config: { idempotency: false } }, async () => ({
    ok: true,
  }));
  app.get("/read", async () => ({ ok: true }));
  await app.ready();
});
afterAll(async () => {
  await app.close();
});

describe("idempotency middleware", () => {
  it("requires Idempotency-Key on mutating requests", async () => {
    const res = await app.inject({ method: "POST", url: "/write" });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("missing_idempotency_key");
  });

  it("executes once and replays the cached response for the same key", async () => {
    const headers = { "idempotency-key": "key-1" };
    const first = await app.inject({ method: "POST", url: "/write", headers });
    const second = await app.inject({ method: "POST", url: "/write", headers });
    expect(first.json()).toEqual(second.json());
    expect(second.headers["idempotency-status"]).toBe("replayed");
  });

  it("different keys execute independently", async () => {
    const a = await app.inject({
      method: "POST",
      url: "/write",
      headers: { "idempotency-key": "key-a" },
    });
    const b = await app.inject({
      method: "POST",
      url: "/write",
      headers: { "idempotency-key": "key-b" },
    });
    expect(a.json().n).not.toBe(b.json().n);
  });

  it("returns 409 while the original request is still in flight", async () => {
    kv.store.set("idem:POST:/write:inflight", "pending");
    const res = await app.inject({
      method: "POST",
      url: "/write",
      headers: { "idempotency-key": "inflight" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("ignores GET requests", async () => {
    const res = await app.inject({ method: "GET", url: "/read" });
    expect(res.statusCode).toBe(200);
  });

  it("lets routes opt out (webhooks bring their own replay protection)", async () => {
    const res = await app.inject({ method: "POST", url: "/webhook" });
    expect(res.statusCode).toBe(200);
  });
});
