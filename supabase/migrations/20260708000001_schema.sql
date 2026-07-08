-- FundRage schema — spec §3 (Phase 0)
-- All 10 tables, enums, FKs, RLS. behavior_events is append-only by trigger.

-- ── Enums ────────────────────────────────────────────────────────────
create type news_event_status as enum ('detected', 'classified', 'matched', 'pushed', 'expired');
create type push_status as enum ('sent', 'opened', 'dismissed', 'converted');
create type donation_status as enum ('initiated', 'confirmed', 'failed');
create type behavior_kind as enum (
  'push_open', 'push_ignore', 'share_in', 'give',
  'amount_change', 'topic_follow', 'topic_unfollow'
);

-- ── users ────────────────────────────────────────────────────────────
create table users (
  id                   uuid primary key default gen_random_uuid(),
  apple_sub            text not null unique,
  email                text,                          -- Apple relay email allowed
  created_at           timestamptz not null default now(),
  default_amount_cents int not null default 1000 check (default_amount_cents > 0),
  push_token           text,                          -- APNs device token
  push_enabled         boolean not null default true,
  quiet_hours_start    time,
  quiet_hours_end      time,
  max_pushes_per_week  int not null default 3 check (max_pushes_per_week >= 1),
  timezone             text not null default 'UTC'    -- IANA name
);

-- ── topics (seed taxonomy) ───────────────────────────────────────────
create table topics (
  id           smallint primary key generated always as identity,
  slug         text not null unique,
  display_name text not null,
  cause_codes  text[] not null default '{}'           -- Charity Navigator cause categories
);

-- ── user_topics ──────────────────────────────────────────────────────
create table user_topics (
  user_id    uuid not null references users (id) on delete cascade,
  topic_id   smallint not null references topics (id),
  weight     float not null default 1.0 check (weight >= 0.1 and weight <= 3.0),
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- ── user_sources (declared consumption environment) ──────────────────
create table user_sources (
  user_id     uuid not null references users (id) on delete cascade,
  source_slug text not null,                          -- apple-news, nyt, cnn, reddit, x, youtube...
  created_at  timestamptz not null default now(),
  primary key (user_id, source_slug)
);

-- ── news_events ──────────────────────────────────────────────────────
create table news_events (
  id             uuid primary key default gen_random_uuid(),
  headline       text not null,
  summary        text,                                -- LLM-generated, ≤2 sentences
  canonical_url  text,
  source_slugs   text[] not null default '{}',
  topic_id       smallint references topics (id),     -- assigned by classifier
  cause_codes    text[] not null default '{}',
  velocity_score float not null default 0,
  first_seen_at  timestamptz not null default now(),
  peaked_at      timestamptz,
  status         news_event_status not null default 'detected'
);
create index news_events_status_idx on news_events (status);
create index news_events_topic_idx on news_events (topic_id);

-- ── charities ────────────────────────────────────────────────────────
create table charities (
  id                        uuid primary key default gen_random_uuid(),
  ein                       text not null unique,
  name                      text not null,
  cause_codes               text[] not null default '{}',
  cn_rating                 float,                    -- matching requires ≥ 75
  charitywatch_grade        text,
  candid_apple_pay_eligible boolean not null default false,  -- refreshed daily (Apple requirement)
  everyorg_slug             text,                     -- Donate Link construction
  last_verified_at          timestamptz               -- re-verify on 24h cycle
);
create index charities_cause_codes_idx on charities using gin (cause_codes);

-- ── event_charity_matches ────────────────────────────────────────────
create table event_charity_matches (
  event_id   uuid not null references news_events (id) on delete cascade,
  charity_id uuid not null references charities (id),
  rank       smallint not null check (rank >= 1),
  rationale  text not null,                           -- one-liner: "on the ground in X"
  created_at timestamptz not null default now(),
  primary key (event_id, charity_id)
);

-- ── pushes ───────────────────────────────────────────────────────────
create table pushes (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references users (id) on delete cascade,
  event_id uuid not null references news_events (id),
  sent_at  timestamptz not null default now(),
  status   push_status not null default 'sent'
);
create index pushes_user_sent_idx on pushes (user_id, sent_at desc); -- weekly-cap + cooldown gates
create unique index pushes_user_event_uq on pushes (user_id, event_id); -- dedup gate (§6.6)

-- ── donations ────────────────────────────────────────────────────────
create table donations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users (id) on delete cascade,
  event_id             uuid not null references news_events (id),
  charity_id           uuid not null references charities (id),
  push_id              uuid references pushes (id),   -- nullable: share-sheet gives have no push
  amount_cents         int not null check (amount_cents > 0),
  everyorg_donation_id text unique,                   -- from Partner Webhook
  status               donation_status not null default 'initiated',
  created_at           timestamptz not null default now(),
  confirmed_at         timestamptz
);
create index donations_user_idx on donations (user_id, created_at desc);

-- ── behavior_events (append-only; the learning loop's raw material) ──
create table behavior_events (
  id         bigint primary key generated always as identity,
  user_id    uuid,                                    -- nullable: account deletion tombstones rows
  kind       behavior_kind not null,
  event_id   uuid references news_events (id),
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index behavior_events_user_idx on behavior_events (user_id, created_at desc);

-- Append-only enforcement: DELETE is never allowed; UPDATE is allowed
-- only as a tombstone (setting user_id to null, all else unchanged).
create function behavior_events_guard() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'behavior_events is append-only; deletes are forbidden';
  end if;
  if new.user_id is not null
     or new.kind is distinct from old.kind
     or new.event_id is distinct from old.event_id
     or new.payload is distinct from old.payload
     or new.created_at is distinct from old.created_at then
    raise exception 'behavior_events rows may only be tombstoned (user_id -> null)';
  end if;
  return new;
end $$;

create trigger behavior_events_append_only
  before update or delete on behavior_events
  for each row execute function behavior_events_guard();

-- ── Row-level security ───────────────────────────────────────────────
-- The API talks to Postgres as the service role, which bypasses RLS.
-- Enabling RLS with no permissive policies means anon/authenticated
-- Postgres roles (e.g. Supabase's PostgREST paths) can read nothing.
alter table users enable row level security;
alter table user_topics enable row level security;
alter table user_sources enable row level security;
alter table pushes enable row level security;
alter table donations enable row level security;
alter table behavior_events enable row level security;
alter table news_events enable row level security;
alter table charities enable row level security;
alter table event_charity_matches enable row level security;
alter table topics enable row level security;

-- Public, non-user data is readable by anyone.
create policy topics_public_read on topics for select using (true);
