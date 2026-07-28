# CLAUDE.md — FundRage

## What this project is

FundRage converts news-driven emotion into verified charitable action. It monitors the news firehose against each user's followed topics, detects surging stories, matches them to vetted nonprofits, and delivers a one-tap Apple Pay donation prompt while the emotion is still hot. Positioning: a reflex layer for civic action.

## Source-of-truth documents (read these before any work)

- `docs/fundrage-backend-spec.md` — full backend spec: data model, services, API, push logic, build phases. This is the build plan. Work phase by phase (§9); do not skip ahead or widen scope.
- `docs/fundrage-flow.mermaid` — end-to-end system flow diagram.
- `docs/project-context.md` — decisions already made and why. Do not relitigate them; raise concerns as questions to the owner instead.

## Non-negotiable principles

1. We NEVER touch money. Donations flow through Every.org (Donate Links + Partner Webhook). No card data, no PCI scope. Donation layer sits behind a `DonationProvider` interface so rails can be swapped later.
2. We NEVER surveil. Consumption signals are declared (onboarding) or volunteered (share sheet) only. No ambient audio, no cross-app tracking, no reading history storage beyond explicit share-ins.
3. Charities must pass ALL filters before appearing anywhere: Charity Navigator rating ≥ 75, Candid Apple Pay eligibility (re-verified within 24h), cause-code match.
4. Pushes are scarce. All 7 gates in spec §6 must pass and each gate must have a unit test.
5. Behavior data is append-only and proprietary. Never delete behavior_events; user account deletion tombstones them.

## Working rules for the agent

- Plan before coding each phase; present the plan for approval first.
- Small commits, one goal per change, reviewable diffs.
- Payments, webhook, and push code require passing tests before merge.
- Webhooks: HMAC verification + replay protection, always.
- Never commit secrets; never log tokens; never log donation amounts alongside PII.
- All write endpoints idempotent via Idempotency-Key header.
- If a third-party API's terms or pricing appear to conflict with usage (Charity Navigator commercial license, Every.org commercial terms, NewsAPI production restrictions), STOP and flag to the owner — do not code around it.

## Current phase

Phase 0 (skeleton) is complete: repo scaffold, Postgres schema + migrations, Sign in with Apple auth, health checks, CI with required tests — all green (30/30 tests passing).

Phase 1 (charity spine): charity sync workers (Charity Navigator, Candid), Every.org Donate Link builder, webhook receiver with HMAC verification + test fixtures. Definition of done: a confirmed test donation round-trips into the `donations` table. See spec §9.
