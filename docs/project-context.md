# FundRage — Project Context & Decisions Log

_Distilled from founding strategy conversation, July 2026. This file is the "why" behind the spec._

## The concept

- Brand: FundRage. Captures "rage giving" — the impulse to act on infuriating/moving news — at the moment of peak emotion, before it evaporates.
- Core loop: user follows topics + declares news sources once → FundRage monitors the news firehose independently → surging story in a followed topic triggers a push → "This is happening. 3 verified orgs are on the ground." → one tap → Apple Pay → done in under 10 seconds → receipt and impact note close the loop.
- Design principle: match the moment, don't create one. The user already saw the story; FundRage is the missing last step of their existing habit, not a new destination. Low effort, low disruption.

## Decisions made (and rationale)

| #   | Decision                                                  | Rationale                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No ambient listening / screen reading                     | Technically partial-possible (ACR, extensions) but a trust grenade for a charity brand. Declared sources + share sheet + firehose monitoring gets ~90% of the anticipation with 0% privacy liability. Big news is synchronized — we don't need to see THEIR feed.                                  |
| 2   | Share-sheet extension is a first-class feature            | Explicit intent signal; bridges into apps we can't see inside (incl. Apple News, which has NO third-party read API).                                                                                                                                                                               |
| 3   | Apple Pay as payment UX                                   | Friction killer; suits one-time impulse gives (Apple Pay is weak for recurring — fine, we're not a pledge product).                                                                                                                                                                                |
| 4   | Every.org as donation rails (v1)                          | 501(c)(3) intermediary: no platform fee, handles receipts, 50-state solicitation registration, Apple Pay support, Partner Webhook for confirmations. We stay out of money transmission and PCI scope. Behind a DonationProvider interface for later swap (e.g., Stripe + fiscal sponsor at scale). |
| 5   | Apple App Review 3.2.1                                    | Multi-charity donation apps must show each charity passed Apple's nonprofit approval (Benevity/Candid). We filter matches by Candid Nonprofit Eligibility API, re-checked daily. Keep a compliance memo in repo.                                                                                   |
| 6   | Charity verification stack                                | Charity Navigator rating ≥75 + CharityWatch reference + Candid eligibility. Trust is the entire brand; a bad charity in a push is an extinction event.                                                                                                                                             |
| 7   | GDELT (free) + RSS as ingestion backbone, NOT NewsAPI.org | NewsAPI.org free tier is dev-only; production jumps to $449/mo. If a commercial aggregator is wanted later: NewsData.io / NewsMesh tier (~$29–90/mo).                                                                                                                                              |
| 8   | LLM matching engine is the proprietary IP                 | claude-sonnet-4-6 via Anthropic API: event→cause classification + charity shortlist re-rank with one-line rationale. Costs scale with news volume, not users (tens of $/mo at MVP).                                                                                                                |
| 9   | Push scarcity is a product value                          | Default 3/wk cap, quiet hours, 18h cooldown, velocity threshold, learned down-throttling after ignored pushes. One great prompt a week beats five mediocre ones a day.                                                                                                                             |
| 10  | iOS-first launch (leaning; open decision §10 of spec)     | Sign in with Apple + Apple Pay + APNs all bundled under the $99/yr developer account.                                                                                                                                                                                                              |

## Cost picture (MVP)

~$100–250/month burn + $99/yr Apple Developer, assuming GDELT route and free/entry tiers (Supabase/Render class hosting, Anthropic API usage, Redis bundled). Costs that scale later: news aggregator tier, Candid contract, Every.org commercial terms, Charity Navigator commercial license — all trigger at monetization, not before.

## Pending negotiations / human tasks (owner, not agent)

- Every.org partner account + commercial-terms conversation before monetization (API free for non-commercial only).
- Charity Navigator: current API terms license non-commercial end-user display; commercial FundRage likely needs their partner/paid tier. Talk to them.
- Candid API contract (commercial, tiered).
- Apple Developer account, APNs .p8 key, bundle ID.
- Anthropic API key + daily budget alert.

## Business context

- Stage: prove viability + find audience, then adapt and monetize.
- Monetization candidates (later): optional tip at checkout, premium tier (impact tracking/tax receipts), employer/CSR matching. Nonprofit-paid placement is on the "careful — erodes trust" list.
- Client design source: Figma prototype (owner-built), importable via Figma MCP server.
- Adjacent competitors to watch: Momentum (trigger-based giving), Daffy, Charityvest.

## Open decisions (owner)

1. iOS-only vs React Native from day one.
2. Velocity threshold tuning: manual dashboard first (decided: start manual).
3. Share-ins private per user in v1 (recommended) vs public feed entries.
