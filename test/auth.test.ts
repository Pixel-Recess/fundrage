import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { createAppleVerifier } from "../src/auth/apple.js";
import { createSessionService } from "../src/auth/session.js";
import { createMigratedDb } from "./helpers/pglite.js";
import { createFakeApple, type FakeApple } from "./helpers/apple.js";
import { createFakeKv, testConfig } from "./helpers/fakes.js";

let db: Awaited<ReturnType<typeof createMigratedDb>>;
let apple: FakeApple;
let app: FastifyInstance;

beforeAll(async () => {
  db = await createMigratedDb();
  apple = await createFakeApple();
  const config = testConfig();
  const verifyAppleToken = createAppleVerifier({
    bundleId: config.apple.bundleId,
    issuer: config.apple.issuer,
    jwksUrl: config.apple.jwksUrl,
    getKey: apple.getKey,
  });
  app = buildApp(config, { db, kv: createFakeKv(), verifyAppleToken });
  await app.ready();
});
afterAll(async () => {
  await app.close();
  await db.close();
});

function post(body: unknown, key = crypto.randomUUID()) {
  return app.inject({
    method: "POST",
    url: "/auth/apple",
    headers: { "idempotency-key": key, "content-type": "application/json" },
    payload: body as Record<string, unknown>,
  });
}

describe("POST /auth/apple", () => {
  it("exchanges a valid identity token for a session and creates the user", async () => {
    const token = await apple.sign({
      sub: "sub-1",
      email: "relay@privaterelay.appleid.com",
    });
    const res = await post({ identity_token: token });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user_id).toMatch(/^[0-9a-f-]{36}$/);

    const sessions = createSessionService(testConfig().jwtSecret);
    const claims = await sessions.verify(body.session_token);
    expect(claims?.userId).toBe(body.user_id);

    const { rows } = await db.query<{ email: string }>(
      `SELECT email FROM users WHERE apple_sub = 'sub-1'`,
    );
    expect(rows[0]?.email).toBe("relay@privaterelay.appleid.com");
  });

  it("is an upsert: same apple_sub returns the same user", async () => {
    const first = await post({
      identity_token: await apple.sign({ sub: "sub-2" }),
    });
    const second = await post({
      identity_token: await apple.sign({ sub: "sub-2" }),
    });
    expect(second.json().user_id).toBe(first.json().user_id);
  });

  it("keeps the existing email when a later token omits it", async () => {
    await post({
      identity_token: await apple.sign({ sub: "sub-3", email: "a@b.c" }),
    });
    await post({ identity_token: await apple.sign({ sub: "sub-3" }) });
    const { rows } = await db.query<{ email: string | null }>(
      `SELECT email FROM users WHERE apple_sub = 'sub-3'`,
    );
    expect(rows[0]?.email).toBe("a@b.c");
  });

  it("rejects a token with the wrong audience", async () => {
    const res = await post({
      identity_token: await apple.sign({ aud: "com.evil.app" }),
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("invalid_identity_token");
  });

  it("rejects a token from the wrong issuer", async () => {
    const res = await post({
      identity_token: await apple.sign({ iss: "https://not-apple.dev" }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a stale token (maxTokenAge 10m)", async () => {
    const staleIat = Math.floor(Date.now() / 1000) - 60 * 60;
    const res = await post({
      identity_token: await apple.sign({ iat: staleIat }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects garbage tokens without leaking detail", async () => {
    const res = await post({ identity_token: "not-a-jwt" });
    expect(res.statusCode).toBe(401);
    expect(JSON.stringify(res.json())).not.toContain("not-a-jwt");
  });

  it("rejects a missing identity_token with 400", async () => {
    const res = await post({});
    expect(res.statusCode).toBe(400);
  });
});
