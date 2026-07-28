# FundRage Backend

Converts news-driven emotion into verified charitable action. See `CLAUDE.md` and `docs/fundrage-backend-spec.md` for the full build plan.

**Status: Phase 0 complete** — scaffold, schema + migrations, Sign in with Apple, health checks, CI (30/30 tests passing). Phase 1 (charity spine) is next up and not yet started. An ingestion worker (GDELT + RSS, normally Phase 2) exists as an exploratory spike ahead of that — see `src/worker.ts`.

## Stack

Node 22 · TypeScript (strict) · Fastify · Postgres (Supabase) · Redis · Vitest.

## Getting started

```bash
npm install
cp .env.example .env        # fill in values; never commit .env
npx supabase start          # local Postgres on :54322 (requires Supabase CLI + Docker)
npx supabase db reset       # applies supabase/migrations/
npm run dev
```

## Commands

```bash
npm run dev        # tsx watch mode (API server)
npm run worker     # ingestion worker (GDELT + RSS, polls every 5 min — see src/worker.ts)
npm test           # vitest (migrations run against embedded PGlite; no Docker needed)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # compile to dist/
```

## Layout

```
src/
  app.ts            # buildApp(config, deps) — all wiring, dependency-injected for tests
  server.ts         # API entrypoint
  worker.ts         # ingestion worker entrypoint (separate process from the API — spec §2)
  config.ts         # env parsing
  logger.ts         # standalone pino logger for code outside the Fastify request context
  auth/             # Apple identity token verification + session JWTs
  plugins/          # idempotency (Idempotency-Key on every write endpoint)
  routes/           # /auth/apple, /healthz, /readyz
  infra/            # pg + ioredis + BullMQ adapters behind Db/Kv/Queue interfaces
  ingestion/        # GDELT + RSS polling, normalize/dedupe, news_events upsert (spec §4.1)
supabase/migrations # SQL schema (spec §3) + topic seed
test/               # vitest; PGlite-backed schema + auth tests, fake-backed ingestion tests
```

## Environment

All secrets live in the platform env vault — never in the repo (see `.env.example`). Human-owned setup tasks (Apple Developer account, APNs key, Every.org partner account, API keys) are tracked in `docs/project-context.md`.
