import type { Kv } from "../../src/types.js";

/** In-memory Kv fake (TTLs ignored — tests are short-lived). */
export function createFakeKv(): Kv & {
  store: Map<string, string>;
  failPing?: boolean;
} {
  const store = new Map<string, string>();
  const kv = {
    store,
    failPing: false,
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async setNx(key: string, value: string, _ttl: number) {
      if (store.has(key)) return false;
      store.set(key, value);
      return true;
    },
    async set(key: string, value: string, _ttl: number) {
      store.set(key, value);
    },
    async ping() {
      if (kv.failPing) throw new Error("redis down");
    },
  };
  return kv;
}

export function testConfig() {
  return {
    env: "test" as const,
    port: 0,
    databaseUrl: "",
    redisUrl: "",
    jwtSecret: "test-secret-test-secret-test-secret!",
    apple: {
      bundleId: "com.fundrage.app",
      jwksUrl: "https://appleid.apple.com/auth/keys",
      issuer: "https://appleid.apple.com",
    },
    pushEnabled: false,
  };
}
