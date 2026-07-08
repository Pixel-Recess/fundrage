# FundRage Backend

Converts news-driven emotion into verified charitable action. See `CLAUDE.md` and `docs/fundrage-backend-spec.md` for the full build plan.

**Status: Phase 0 (skeleton)** — scaffold, schema + migrations, Sign in with Apple, health checks, CI.

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
npm run dev        # tsx watch mode
npm test           # vitest (migrations run against embedded PGlite; no Docker needed)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # compile to dist/
```

## Layout

```
src/
  app.ts            # buildApp(config, deps) — all wiring, dependency-injected for tests
  server.ts         # entrypoint
  config.ts         # env parsing
  auth/             # Apple identity token verification + session JWTs
  plugins/          # idempotency (Idempotency-Key on every write endpoint)
  routes/           # /auth/apple, /healthz, /readyz
  infra/            # pg + ioredis adapters behind Db/Kv interfaces
supabase/migrations # SQL schema (spec §3) + topic seed
test/               # vitest; PGlite-backed schema + auth tests
```

## Environment

All secrets live in the platform env vault — never in the repo (see `.env.example`). Human-owned setup tasks (Apple Developer account, APNs key, Every.org partner account, API keys) are tracked in `docs/project-context.md`.
