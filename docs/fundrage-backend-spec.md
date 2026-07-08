# FundRage — Backend Technical Specification (MVP)

**Purpose:** Build plan for the FundRage backend. Pair with the Figma prototype (client) and the system flow diagram. Written to be handed directly to Claude Code as the source of truth for an agentic build.

**Product in one sentence:** FundRage monitors the news firehose against each user's followed topics, detects surging stories, matches them to verified nonprofits, and delivers a one-tap Apple Pay donation prompt while the emotion is still hot.

## 1\. Architecture Principles

1.  > **Rails are rented, IP is owned.** Donations flow through Every.org (v1). The matching engine, preference database, and behavior data are proprietary and live in our infrastructure. The donation layer sits behind an internal interface (DonationProvider) so rails can be swapped (e.g., Stripe + fiscal sponsor) without touching product code.

2.  > **We never touch money.** No PCI scope, no money transmission. Every.org processes; we deep-link and receive webhooks.

3.  > **We never surveil.** All consumption signals are declared (onboarding) or volunteered (share sheet). No ambient listening, no cross-app visibility.

4.  > **Pushes are scarce.** One great prompt a week beats five mediocre ones a day. The push decision engine enforces caps, quiet hours, and velocity thresholds.

5.  > **Everything the user does is a training signal.** Opens, ignores, shares, and gives feed back into targeting.

## 2\. Recommended Stack (MVP)

| **Layer**         | **Choice**                                                                   | **Rationale**                                                                |
| ----------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| API               | Node.js (TypeScript) + Fastify, or Python + FastAPI                          | Claude Code fluency, async-friendly for webhooks/ingestion                   |
| Database          | Postgres (Supabase or RDS)                                                   | Relational fits the model; Supabase adds auth + row-level security fast      |
| Cache/queues      | Redis (velocity counters, dedupe, job queue via BullMQ)                      | Trending detection is counter math                                           |
| Ingestion workers | Scheduled jobs (cron / worker dynos) polling NewsAPI, GDELT, RSS             | Simple, cheap, replaceable                                                   |
| LLM matching      | Anthropic API (claude-sonnet-4-6), structured JSON output                    | Event→cause classification + charity shortlist ranking                       |
| Push              | APNs via token-based auth (node-apn or FCM for cross-platform later)         | iOS-first launch                                                             |
| Donations         | Every.org Donate Links + Partner Webhook                                     | No platform fee; they hold 501(c)(3) status, receipts, 50-state registration |
| Charity data      | Charity Navigator API + CharityWatch list + Candid Nonprofit Eligibility API | Ratings filter + Apple Pay eligibility filter                                |
| Hosting           | Render / Fly.io / Railway (MVP)                                              | Fast to stand up; migrate later if needed                                    |
| Auth              | Sign in with Apple (required for iOS anyway) + Supabase Auth                 | Lowest-friction onboarding                                                   |

## 3\. Data Model (Postgres)

### users

| **column**                              | **type**          | **notes**                                |
| --------------------------------------- | ----------------- | ---------------------------------------- |
| id                                      | uuid PK           |                                          |
| apple\_sub                              | text unique       | Sign in with Apple subject               |
| email                                   | text nullable     | relay email allowed                      |
| created\_at                             | timestamptz       |                                          |
| default\_amount\_cents                  | int               | preset give: 500 / 1000 / 2500, user-set |
| push\_token                             | text nullable     | APNs device token                        |
| push\_enabled                           | bool default true |                                          |
| quiet\_hours\_start / quiet\_hours\_end | time nullable     | local time                               |
| max\_pushes\_per\_week                  | int default 3     | user-adjustable cap                      |
| timezone                                | text              | IANA name                                |

### topics (seed taxonomy, \~20–40 rows)

| **column**    | **type**    | **notes**                                                                             |
| ------------- | ----------- | ------------------------------------------------------------------------------------- |
| id            | smallint PK |                                                                                       |
| slug          | text unique | climate, education, civil-rights, disaster-relief, animal-welfare, press-freedom, ... |
| display\_name | text        |                                                                                       |
| cause\_codes  | text\[\]    | maps to Charity Navigator cause categories                                            |

### user\_topics

| user\_id FK · topic\_id FK · weight float default 1.0 · created\_at | Weight is adjusted by the learning loop (gives raise it, ignored pushes lower it). PK (user\_id, topic\_id).

### user\_sources (declared consumption environment)

| user\_id FK · source\_slug text (apple-news, nyt, cnn, reddit, x, youtube...) · created\_at | Used to weight which outlets' velocity matters for this user's trending detection.

### news\_events

| **column**                   | **type**                                         | **notes**                   |
| ---------------------------- | ------------------------------------------------ | --------------------------- |
| id                           | uuid PK                                          |                             |
| headline                     | text                                             |                             |
| summary                      | text                                             | LLM-generated, ≤2 sentences |
| canonical\_url               | text                                             |                             |
| source\_slugs                | text\[\]                                         | outlets carrying it         |
| topic\_id                    | FK                                               | assigned by classifier      |
| cause\_codes                 | text\[\]                                         | assigned by classifier      |
| velocity\_score              | float                                            | see §6                      |
| first\_seen\_at / peaked\_at | timestamptz                                      |                             |
| status                       | enum: detected classified matched pushed expired |                             |

### charities

| **column**                   | **type**      | **notes**                                        |
| ---------------------------- | ------------- | ------------------------------------------------ |
| id                           | uuid PK       |                                                  |
| ein                          | text unique   |                                                  |
| name                         | text          |                                                  |
| cause\_codes                 | text\[\]      |                                                  |
| cn\_rating                   | float         | Charity Navigator score (require ≥ 3 stars / 75) |
| charitywatch\_grade          | text nullable |                                                  |
| candid\_apple\_pay\_eligible | bool          | refreshed daily (Apple requires daily checks)    |
| everyorg\_slug               | text          | for Donate Link construction                     |
| last\_verified\_at           | timestamptz   | re-verify on 24h cycle                           |

### event\_charity\_matches

| event\_id FK · charity\_id FK · rank smallint · rationale text (one-liner: "on the ground in X") · created\_at |

### pushes

| **column**           | **type**                              | **notes**                          |
| -------------------- | ------------------------------------- | ---------------------------------- |
| id                   | uuid PK                               |                                    |
| user\_id / event\_id | FKs                                   |                                    |
| sent\_at             | timestamptz                           |                                    |
| status               | enum: sent opened dismissed converted | updated by client events + webhook |

### donations

| **column**                                    | **type**                                                 | **notes**            |
| --------------------------------------------- | -------------------------------------------------------- | -------------------- |
| id                                            | uuid PK                                                  |                      |
| user\_id / event\_id / charity\_id / push\_id | FKs (push\_id nullable — share-sheet gives have no push) |                      |
| amount\_cents                                 | int                                                      |                      |
| everyorg\_donation\_id                        | text                                                     | from Partner Webhook |
| status                                        | enum: initiated confirmed failed                         |                      |
| created\_at / confirmed\_at                   | timestamptz                                              |                      |

### behavior\_events (append-only)

| user\_id · kind enum (push\_open push\_ignore share\_in give amount\_change topic\_follow topic\_unfollow) · event\_id nullable · payload jsonb · created\_at | This table is the learning loop's raw material. Never delete.

## 4\. Services

### 4.1 Ingestion Service (worker, every 5 min)

- > Poll NewsAPI top headlines + GDELT 2.0 events + curated RSS list.

- > Normalize → dedupe (Redis fingerprint on normalized headline + domain cluster) → upsert news\_events candidates.

- > Emit event.detected job.

### 4.2 Classifier (LLM, job consumer)

- > Input: headline + summary/lede.

- > Prompt returns strict JSON: { topic\_slug, cause\_codes\[\], summary, actionable: bool }.

- > actionable=false (e.g., celebrity news, sports) → mark expired, stop.

- > Idempotent; retries with backoff; log token cost per event.

### 4.3 Velocity Engine (Redis counters)

- > Per event cluster: count distinct sources + article mentions in sliding 1h/6h windows.

- > velocity\_score = w1·source\_count + w2·mention\_rate\_delta + w3·major\_outlet\_bonus

- > Threshold V\_push (start: score ≥ 0.7 normalized, tune weekly). Crossing threshold → emit event.surging.

### 4.4 Matcher (job consumer on event.surging)

- > Query charities where cause\_codes && event.cause\_codes AND cn\_rating ≥ 75 AND candid\_apple\_pay\_eligible = true AND last\_verified\_at \> now()-24h.

- > LLM re-rank top 10 → top 3 with one-line rationale each ("running shelters in the flood zone").

- > Write event\_charity\_matches, set event matched.

### 4.5 Push Decision Engine (see §6) → APNs sender.

### 4.6 Donation Service

- > Build Every.org Donate Link with prefilled amount + redirect-back params.

- > Insert donations row (initiated) before handoff.

- > **Webhook endpoint** /webhooks/everyorg (HMAC-verified): match by donation metadata → set confirmed, stamp everyorg\_donation\_id, mark push converted, append behavior\_events(kind='give'), trigger closure push/in-app receipt card.

### 4.7 Charity Sync (daily worker)

- > Refresh Charity Navigator ratings, CharityWatch grades, Candid Apple Pay eligibility (daily check is an Apple requirement).

- > Any charity failing a check → excluded from matching immediately.

### 4.8 Learning Loop (nightly batch, simple v1)

- > weight += 0.3 per give in topic; weight -= 0.05 per ignored push; clamp \[0.1, 3.0\].

- > Users whose last 3 pushes were ignored → auto-reduce their weekly cap by 1 (floor 1) until next give.

## 5\. API (client-facing, JSON, bearer auth)

POST /auth/apple \# exchange Apple identity token → session

GET /topics \# taxonomy for onboarding picker

PUT /me/topics \# \[{topic\_id, follow:bool}\]

PUT /me/sources \# \[source\_slug\]

PUT /me/preferences \# default\_amount\_cents, quiet hours, weekly cap, push\_enabled

POST /me/push-token \# APNs token registration

GET /feed \# recent matched events for user's topics (in-app feed)

GET /events/:id \# event + top-3 charities + rationales

POST /events/:id/give \# {charity\_id, amount\_cents} → returns Every.org Donate Link (donation row created)

POST /share-in \# {url} → classify article → return event + matches (creates event if novel)

POST /telemetry \# batched behavior\_events from client (push\_open, dismiss, etc.)

GET /me/impact \# giving history, totals, receipts index

POST /webhooks/everyorg \# HMAC-verified; not client-facing

All writes idempotent via Idempotency-Key header. Rate-limit /share-in (10/min/user).

## 6\. Push Decision Logic

A push fires for user U on event E only if **all** pass:

1.  > E.velocity\_score ≥ V\_push and E.status = matched

2.  > E.topic\_id ∈ U.followed\_topics with weight ≥ 0.5

3.  > U under weekly cap (pushes sent in trailing 7d \< min(user cap, learned cap))

4.  > Outside U's quiet hours (convert to U.timezone)

5.  > Cooldown: no push to U in the last 18h

6.  > Dedup: U not already pushed for this event cluster

7.  > Source affinity bonus: if E.source\_slugs ∩ U.sources ≠ ∅, lower the velocity threshold by 15% (they're likely already seeing it — that's the giving zone)

Payload: headline framing + charity count, deep link to /events/:id give screen. Copy pattern: **"\[What happened\]. 3 verified orgs are on the ground. Tap to help."**

Kill switch: global PUSH\_ENABLED env flag; per-event retraction if a story corrects/retracts (manual admin endpoint for v1).

## 7\. External Integrations

| **Integration**                  | **Mode**                       | **Keys/Setup (human tasks)**                                                                       |
| -------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Every.org                        | Donate Links + Partner Webhook | Create partner account; discuss commercial terms before monetization (API free for non-commercial) |
| Charity Navigator API            | Ratings pull                   | API key (free tier to start)                                                                       |
| Candid Nonprofit Eligibility API | Apple Pay eligibility, daily   | Candid account                                                                                     |
| NewsAPI / GDELT / RSS            | Ingestion                      | NewsAPI key; GDELT is open                                                                         |
| Anthropic API                    | Classifier + matcher re-rank   | API key; budget alert at $X/day                                                                    |
| APNs                             | Push                           | Apple Developer account, APNs auth key (p8), app bundle ID                                         |
| Sign in with Apple               | Auth                           | Same developer account                                                                             |

## 8\. Security, Privacy, Compliance

- > **Data minimization:** no article-level reading history stored except explicit share-ins; declared sources are a flat list, not activity.

- > Row-level security on all user tables; behavior\_events readable only by service role.

- > Webhook endpoints: HMAC signature verification + replay protection (timestamp window).

- > Secrets in platform env vault; never in repo. Claude Code instruction: **never commit keys, never log tokens or donation amounts with PII together.**

- > Privacy policy + App Store privacy labels: declare topics/preferences, giving history, device token. Nothing else collected.

- > App Review prep (Guideline 3.2.1): documentation that all listed charities are verified 501(c)(3)s and donations are processed by Every.org (itself a 501(c)(3)); expect reviewer questions — keep a compliance memo in the repo.

- > Delete-my-account endpoint: hard-delete user rows, tombstone behavior\_events (required for App Store).

## 9\. Build Phases (hand to Claude Code in this order)

**Phase 0 — Skeleton (day 1–2)** Repo scaffold, Postgres schema + migrations, auth (Sign in with Apple), health checks, CI with tests required.

**Phase 1 — Charity spine (day 2–4)** charities sync workers (Charity Navigator, Candid), Every.org Donate Link builder, webhook receiver with HMAC verification + test fixtures. _Definition of done: a confirmed test donation round-trips into the donations table._

**Phase 2 — News spine (day 4–7)** Ingestion workers, dedupe, LLM classifier with JSON-schema-validated output, velocity engine with tunable weights. _DoD: real surging story lands in news\_events as matched with 3 ranked charities._

**Phase 3 — User loop (day 7–10)** Topics/sources/preferences endpoints, feed, give flow, share-in endpoint, telemetry ingestion.

**Phase 4 — Push (day 10–13)** Decision engine (all 7 gates unit-tested), APNs sender, deep links, kill switch.

**Phase 5 — Learning + hardening (day 13+)** Nightly weight batch, rate limits, load test ingestion, admin retraction endpoint, App Review compliance memo.

**Standing instructions for the agent:** plan before coding each phase; small commits; every gate in §6 gets a unit test; payments and webhook code require passing tests before merge; never widen scope beyond the phase.

## 10\. Open Decisions (owner: you)

1.  > iOS-only launch (recommended) vs. React Native cross-platform from day one.

2.  > Every.org commercial terms conversation — before or after monetization switch-on.

3.  > Velocity threshold governance: manual tuning dashboard vs. auto-tuned (start manual).

4.  > Whether share-in creates public feed entries or stays private per user (recommend private for v1).
