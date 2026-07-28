import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

function baseEnv(
  overrides: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "production",
    JWT_SECRET: "a-sufficiently-long-production-secret-value",
    ...overrides,
  } as NodeJS.ProcessEnv;
}

describe("loadConfig", () => {
  it("accepts a strong JWT_SECRET in production", () => {
    expect(() => loadConfig(baseEnv())).not.toThrow();
  });

  it("rejects the default placeholder secret in production", () => {
    expect(() => loadConfig(baseEnv({ JWT_SECRET: "change-me" }))).toThrow(
      /JWT_SECRET/,
    );
  });

  it("rejects a short secret in production", () => {
    expect(() => loadConfig(baseEnv({ JWT_SECRET: "too-short" }))).toThrow(
      /JWT_SECRET/,
    );
  });

  it("rejects a missing secret in production", () => {
    const env = baseEnv();
    delete env.JWT_SECRET;
    expect(() => loadConfig(env)).toThrow(/JWT_SECRET/);
  });

  it("does not enforce the JWT_SECRET strength check outside production", () => {
    expect(() =>
      loadConfig(baseEnv({ NODE_ENV: "development", JWT_SECRET: "change-me" })),
    ).not.toThrow();
  });

  it("falls back to a dev-only secret when unset outside production", () => {
    const env = baseEnv({ NODE_ENV: "development" });
    delete env.JWT_SECRET;
    const config = loadConfig(env);
    expect(config.jwtSecret).toBe("dev-only-secret");
  });
});
