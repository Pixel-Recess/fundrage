export interface Config {
  env: "development" | "test" | "production";
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  apple: {
    bundleId: string;
    jwksUrl: string;
    issuer: string;
  };
  pushEnabled: boolean;
  ingestion: {
    intervalMinutes: number;
    gdeltQuery: string;
    dedupeTtlHours: number;
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const nodeEnv = (env.NODE_ENV ?? "development") as Config["env"];
  const jwtSecret = env.JWT_SECRET ?? "";
  if (
    nodeEnv === "production" &&
    (jwtSecret.length < 32 || jwtSecret === "change-me")
  ) {
    throw new Error("JWT_SECRET must be set to a strong value in production");
  }
  return {
    env: nodeEnv,
    port: Number(env.PORT ?? 3000),
    databaseUrl:
      env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:54322/postgres",
    redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
    jwtSecret: jwtSecret || "dev-only-secret",
    apple: {
      bundleId: env.APPLE_BUNDLE_ID ?? "com.fundrage.app",
      jwksUrl: env.APPLE_JWKS_URL ?? "https://appleid.apple.com/auth/keys",
      issuer: env.APPLE_ISSUER ?? "https://appleid.apple.com",
    },
    pushEnabled: env.PUSH_ENABLED === "true", // global kill switch, default OFF (spec §6)
    ingestion: {
      intervalMinutes: Number(env.INGESTION_INTERVAL_MINUTES ?? 5),
      // GDELT DOC 2.0 API query syntax — see https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
      gdeltQuery: env.GDELT_QUERY ?? "sourcelang:english",
      dedupeTtlHours: Number(env.INGESTION_DEDUPE_TTL_HOURS ?? 48),
    },
  };
}
