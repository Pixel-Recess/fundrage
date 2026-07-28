# FundRage frontend (prototype)

Vite + React + TypeScript. No backend integration yet — screens are wired with local
component state only.

## Run it

```
npm install
npm run dev
```

## Demo flow

`App.tsx` chains: **Onboarding (3 steps) → Topics → Sources → Welcome → Create Account → Feed**.
Account creation happens right after picking sources, before the feed is ever shown — Create
Account used to come *after* Feed, with Feed's footer as the CTA into it; that footer is gone
now, since there's nothing left to convert into once the feed itself is signed-in. With a branch off Feed:
**Feed → (tap an article) → Article Detail → See Nonprofits → Nonprofits list → (tap a
nonprofit) → Donate → DonationSuccess**, which drops back at Feed and adds an entry to Donation
Receipts. Back-chaining all the way to Feed. A second branch off Feed opens Settings: **Feed →
(tap the header profile icon) → Account → Profile / Your Topics / News Sources / Donation
Receipts / Notifications / Contact Us**, all Back-chaining to Account. Onboarding and Topics are
ported from the Figma prototype
(`Fundrage-App-Dev`, node-ids 21:604/21:661/21:706 for Onboarding, see Topics section below) —
everything from Sources onward is a fresh build, because the prototype's actual next screens
(Causes drill-down, Nonprofits discovery) reflected an older charity-browsing direction, not the
"declare sources → personalized feed" direction this demo follows. The Nonprofits-from-article
screen below is a partial exception — it reuses that old Figma screen's *structure*, just
reconnected to the new Feed-based flow instead of the old Causes path.

⚠️ This demo flow (declared sources feeding a browsable in-app feed) currently sits in tension
with `docs/project-context.md`'s stated core concept — "match the moment, don't create one...
not a new destination" — and `CLAUDE.md`'s non-negotiable that consumption signals are
declared/volunteered only, with no in-app feed. Worth reconciling those docs with whichever
direction is actually intended before this goes further.

## What's here

- `src/components/ScreenHeader.tsx`, `NavFooter.tsx`, `ProfileIcon.tsx` — shared header
  (Rage200 bar + profile glyph + title) and Back/Next footer, factored out once three screens
  needed the identical markup. `NavFooter` takes optional `backLabel`/`nextLabel` overrides
  (Onboarding uses "Skip" / "Next" / "Get Started"). `ScreenHeader` takes an optional
  `showProfileIcon` (default `true`), added for a 5-step "share sheet tutorial" carousel that
  was built and then removed the same session — turned out not to fit this version of the
  product, which engages primarily through email + push, not an iOS share-sheet extension.
  The bar itself is no longer a fixed 120px baked in from the Figma iPhone mockup — it's a
  72px row plus `padding-top: max(20px, env(safe-area-inset-top))` on top (reserving room for
  whatever status bar / notch / Dynamic Island the real device has, instead of guessing one
  device's measurements up front), with the title/icon bottom-aligned inside that row (25px
  gap from the row's bottom edge) rather than vertically centered. Title weight dropped to 300
  (Barlow Condensed Light) from the unset default (400). `ScreenHeader` briefly grew an
  `onBack` prop that rendered a back-chevron in the header (used by Account) — reverted; it
  broke the app's established back-navigation pattern (a footer button), so Account's Back
  button now lives in a footer alongside Sign Out instead, and `ScreenHeader` only ever shows
  the profile icon (or nothing) in its leading slot. `NavFooter`'s right-hand button is now
  Aqua200 (filled) when enabled and Aqua100 when not, instead of Mist200/Mist100 — same rule
  applied to Account's Sign Out button (always Aqua200; there's no "unchanged" state for
  signing out) and its Back button (unchanged, stays the neutral Mist-bordered style). This
  made "enabled" mean something real for the first time on a couple of screens: Profile's
  "Save Updates" and Topics/Sources' edit-mode "Save" used to be enabled whenever anything was
  selected, even if it was just the same set of topics/sources you opened the screen with —
  now they only enable once the selection or form actually differs from what you started with
  (`hasChanges`, compared against a captured-on-mount initial value), so the button's color
  correctly reflects "there's something to save," not just "the form isn't empty."
- `src/screens/Onboarding/` — the three intro screens ("Feel" / "Find" / "Fundrage"), built from
  Figma nodes 21:604, 21:661, 21:706. Each illustration is composited from two flattened Figma
  exports (a shared circular background + the unique per-step illustration) rather than
  reproduced as hand-built vector art — the prototype's vector breakdown for these was 15–20
  tiny positioned groups per screen, not worth hand-porting. The progress dots are plain CSS,
  not the static image Figma exports (trivial to reproduce, and needed to stay in sync with
  `ONBOARDING_STEPS.length` if steps are ever added/removed). The prototype's bottom-nav buttons
  both literally say "SKIP" in Figma (a labeling bug in the file) — implemented here as the
  obviously-intended Skip / Next (Get Started on the last step) instead. **Real swipe support**:
  the word/illustration/body block for all 3 steps renders in a single flex row
  (`.trackWrap`/`.track`/`.slide`), translated via pointer events (`onPointerDown/Move/Up`, not a
  library) — drag left/right to move between steps with 1:1 finger tracking, snapping on release
  past a 60px threshold, with edge resistance (0.3x drag) when swiping past the first/last step.
  The header (`.topBar`) and footer (progress dots, login link, Skip/Next) sit outside the
  translated track, so they never move. Tapping Next/Skip still works independently of dragging.
- `src/screens/TopicSelection/` — the onboarding topic-selection screen, now built from the
  "Topics-Option_Photos" / "Topics-Option_Photos-Selcted" frames in the `Fundrage-App-Dev`
  Figma file (photo tiles, not icons). Topics toggle on tap (multi-select); selected topics
  go full opacity and show a large centered checkmark badge (60×60px, white circle + Aqua300
  check — updated from an original small 15×15 corner badge). The footer has real BACK/NEXT
  buttons matching the Figma component (NEXT is disabled — mist bg/text — until at least one
  topic is selected, then switches to mist200 bg/black text; it does not turn a bold color).
  Note: the selected tile's **border no longer changes color** (stays Mist200) — an earlier
  version of this frame had it turn Aqua300 on selection, but the current Figma data shows it
  reverted to neutral, with the checkmark alone carrying the "selected" signal. Implemented to
  match what's actually there now; flag if that reversion wasn't intentional.
- `src/styles/tokens.css` — color tokens copied from `brand/style-guide.md`. Keep these in
  sync if that file changes.
- `src/styles/fonts.css` — `@font-face` declarations for Barlow Condensed and Barlow (all 9
  weights × italic each, from `src/assets/fonts/`, SIL Open Font License). Exposed as
  `--font-display` (Barlow Condensed) and `--font-body` (Barlow) in `tokens.css`. The footer
  BACK/NEXT labels use `--font-body` at weight 800, matching the Figma frame's `Barlow:ExtraBold`.
- `src/assets/photos/topics/` — all 20 topics now have their own distinct photo. Despite the
  original Figma layer name "Pexels Photo by Alena Koval", the embedded EXIF data traces these
  back to Unsplash (permissive license, no attribution required). Most are `.png` — Figma's
  own rendered composite export for that node (mask + crop already applied), pulled directly
  per-node rather than trusted from the aggregated design-context dump, which turned out to
  have a real bug: it silently resolved "Equal Pay" and "Refugees" to the wrong shared image
  (a money photo and a stethoscope photo respectively) when their actual real photos are
  distinct (cash bills for Equal Pay is correct; a street/clothesline scene for Refugees). Five
  topics (Social Justice, Veterans, Voting Rights, Women's Rights, Children's Services) are
  still `.jpg` raw source images because their nodes wouldn't render an isolated export through
  any method tried — those were double-checked another way (unique, non-shared source
  references) and are believed correct, but haven't been visually confirmed against a render
  the way the rest have.
- `src/assets/icons/` — the previous icon-based topic set (`Topics-Option_Icons`), no longer
  used by `TopicSelection` but left in place in case that variant is wanted again.
- `src/assets/icons/noun-project/` — a staged library of Noun Project icons (Adrien Coquet)
  for expanding/improving topic icons later. Not wired into any component yet — check
  licensing/attribution requirements before shipping these.
- `src/screens/SourceSelection/` — fresh screen, no Figma equivalent. Simple multi-select list
  of source names matching the shape of `user_sources.source_slug` in the backend schema, not
  a real source integration.
- `src/screens/Feed/` — now ported from Figma's redesigned "News" frame (3015:2569). Articles
  are grouped into sections by topic (red section header, one per followed topic that has
  matching stories), each row showing a photo, headline, a short preview snippet, and a source
  pill, still filtered by the topics picked in `TopicSelection` only (source selection isn't a
  display filter — in the real backend, `source_slugs` describe where ingestion detected a
  story, not a per-user feed filter). Section order follows `TOPICS` order, not selection order,
  so it's stable across reloads. Added a `preview` field to `Feed/articles.ts` for the new
  snippet — written as short realistic-sounding copy rather than Figma's literal Lorem Ipsum,
  matching how other mock data in this prototype avoids placeholder text. Still reuses the topic
  photos as thumbnails rather than Figma's generic "PHOTO" placeholder box. An "Add Location"
  filter button from the Figma frame was intentionally **not** carried over — it sits off-canvas
  (`left: -340px`) in the file and reads as a hidden/inactive state rather than a real part of
  this screen (consistent with the location-filter pill already dropped from
  `NonprofitsFromArticle`). The footer is now Back-only (matching the frame, which renders with
  no bottom nav) since Create Account moved earlier in the flow — see "Demo flow" above — so
  there's no longer a forward action needed from Feed.
- `src/screens/ArticleDetail/` — fresh build. The Figma "News Article" frame (node `1:2`) turned
  out to be just a full-bleed screenshot image with no real layout underneath — nothing there to
  port. Shows the topic photo, headline, source, and a placeholder body paragraph with a note
  that real article rendering doesn't exist yet (Phase 2). Has a "See Nonprofits" action.
- `src/screens/NonprofitsFromArticle/` — loosely ported from Figma's "Nonprofits - From Article"
  frame (node `147:1864`), simplified (dropped the search bar and location-filter pill — neither
  does anything real yet) and with two content fixes rather than a straight port:
  - The alert copy was rewritten from Figma's "rated 3-stars and above" to match the actual spec
    threshold — Charity Navigator rating **>= 75** plus Candid Apple Pay eligibility (spec §4.4)
    — since that's the real non-negotiable filter, not the Figma copy's version of it.
  - The mock nonprofit list (`nonprofits.ts`) uses **entirely fictional org names**, not the real
    ones Figma's version used (Everytown, Giffords, NRA, etc.). Two reasons: first, there's no
    real Charity Navigator/Candid verification behind this list (that's Phase 1), so labeling
    real orgs as "verified" here would misrepresent them. Second, Figma's list literally included
    the **NRA** alongside gun-violence-prevention orgs — a real content bug, since the NRA is a
    501(c)(4) advocacy group opposed to that cause, not a 501(c)(3) charity aligned with it, and
    would never pass the spec's own vetting criteria.
- `src/screens/Welcome/` — ported from Figma's "Thank You" frame (66:1226), but placed *before*
  Create Account rather than after, per explicit request. That frame's original copy ("Thank you
  for creating an account with Fundrage.") only makes sense post-signup, so it's rewritten here as
  a pre-signup "nice work, here's what's next" moment ("You've picked your topics and news
  sources — nice work.") instead of a literal port. The trophy/confetti illustration and the
  "Time to get giving." line are carried over unchanged — neither references account creation, so
  both still fit before signup. Sits between Sources and Create Account: Sources → Welcome →
  Create Account → Feed.
- `src/screens/CreateAccount/` — deliberately does **not** port the Figma "Create Account"
  frame, which mocks up email/password plus Google/Apple/Facebook sign-in. Our real backend
  (`src/auth/apple.ts`) only implements Sign in with Apple, so this screen offers just that one
  button (mocked — no real Apple Developer/domain verification exists in this demo
  environment, so clicking it just advances the flow rather than calling `/auth/apple`).
- `src/screens/Account/` — the Settings hub, built from Figma's "Account" frame (41:1166).
  Reachable by tapping the header profile icon from Feed (added `onProfileClick` to
  `ScreenHeader`, previously decorative-only). Shows the profile summary, then rows for Your
  Profile / Your Topics / News Sources / Donation Receipts / Notifications / Contact Us / FAQs /
  User Agreement / Privacy Policy, a Sign Out button, and Delete Your Account (opens the confirm
  dialog ported from "Account - Delete", 64:1319). **Payment Method, and the donation-stats
  donut chart from "Account - Delete", are still intentionally left out** — payment settings
  aren't in scope, and a stats chart with no real donation data behind it would be misleading.
  Donation Receipts was added back on request (see `src/screens/Receipts/`) since a receipt
  history doesn't require touching payment/card data itself. `src/screens/Account/profile.ts`
  holds the mock `UserProfile` shape and default (fictional) values shared by Account and
  Profile. Back navigation briefly
  moved to a chevron in the header (matching a Figma update at the time) but was reverted —
  it broke the app's established pattern of Back living in a footer, not the header — so Back
  now sits in a footer alongside Sign Out (moved down from a standalone button in the content
  area). Delete Your Account stays where it was, in the scrollable content. The profile
  summary (avatar + name) sits in its own full-bleed Mist100 band directly under the header,
  matching Figma's light gray block behind that row, rather than sitting on plain white inside
  `.content` like everything below it.
- `src/screens/Profile/` — merges Figma's "Profile" and "Profile - Edit" frames (44:1447,
  51:1586) into one always-editable form, since the two frames are otherwise identical (the
  Figma versions only differ in which field shows an edit cursor). **Password / Re-enter
  Password fields are dropped entirely** — this app only supports Sign in with Apple, so there's
  no password to manage (same reasoning as `CreateAccount`). The photo action sheet ("Profile -
  Photo", 51:1667) is real — tapping the avatar or camera badge opens a bottom-sheet modal
  matching Figma's copy, and both "Photo Library" and "Take a Photo" open the same
  `<input type="file">` (a browser page can't distinguish the two, or access a native camera
  reliably). Saving shows the "Profile - Updated" (206:1811) success toast before returning to
  Account.
- `src/components/icons/` — small inline-SVG icon components, all Google Material Icons
  (Apache 2.0), pulled from the official `google/material-design-icons` repo and inlined
  directly rather than adding an icon-font or npm dependency — same self-hosting approach this
  project already uses for fonts. Two batches:
  - `ChevronRightIcon`, `ChevronLeftIcon`, `OpenInNewIcon`, `PhotoCameraIcon`, `RadioButtonIcon`
    replace text-glyph stand-ins (`›`, `↗`, a 📷 emoji, `●`/`○`) used across
    Account/Profile/Notifications/Contact.
  - `AccountCircleIcon`, `LabelIcon`, `ChromeReaderModeIcon`, `NotificationsIcon`, `ChatIcon`,
    `HelpIcon`, `DescriptionIcon`, `VerifiedUserIcon`, `ExitToAppIcon` (Account's row/Sign-Out
    icons) and `PersonIcon`, `AlternateEmailIcon`, `EmailIcon`, `PhoneIcon`, `LocationOnIcon`
    (Profile's field icons) are a new addition, not a swap — Figma's rows/fields use Apple SF
    Symbols (`person.crop.circle`, `bell`, `text.bubble`, `lock.shield`, etc.), which don't
    exist as web assets, so these are Material equivalents chosen for a reasonable semantic
    match rather than a literal one — e.g. Figma's "Your Topics" row uses `dollarsign.circle`
    and "User Agreement" uses `contextualmenu.and.pointer.arrow`, both of which read as
    placeholder/mismatched choices in the source file, so `LabelIcon` (tag) and
    `DescriptionIcon` (document) were picked as what those rows actually mean instead of
    porting the mismatch. All of Account's row icons (leading and trailing) and Profile's
    field icons are colored Mist200 rather than each pulling its own accent color (Rage200,
    Navy500, Aqua200) — kept deliberately muted so they read as quiet labels supporting the
    text, not competing with it for attention.
- `src/screens/Notifications/` — from Figma's "Notifications" frame (57:1103). Toggles
  (donation-reminder nudge, push/text/email channels) save to local state immediately, no
  separate Save step — matches how iOS Settings toggles actually behave. Figma's footer CTA
  ("START DONATING") only makes sense in an onboarding context; here it's a plain Back link.
- `src/screens/Contact/` — from Figma's "Contact" frame (57:1155). Single-select issue-type list
  plus a free-text details field; "Send Feedback" is mocked (no support inbox exists), showing a
  confirmation toast and returning to Account.
- `src/screens/Receipts/` — added back after initially being excluded alongside Payment. Built
  from Figma's "Receipts - Empty" (55:2291), "Receipts" (85:2061), "Receipt - View" (57:1049),
  and "Receipt - Email success" (85:2765) frames. `Receipts` lists past donations (nonprofit,
  date, card label, amount) or the empty-state illustration when the list is empty —
  `receiptsData.ts` ships populated by default so the list state is actually visible, reusing
  nonprofit names already established in `NonprofitsFromArticle/nonprofits.ts` rather than
  inventing new ones. `ReceiptDetail` merges the view/email-success frames into one component
  (the local-state toast pattern used elsewhere). Two deviations from Figma: the Mastercard
  network logo image isn't reproduced (a registered trademark not worth embedding for a demo —
  the "Mastercard ending in 4444" text label alone carries the same information), and that label
  itself is framed as what Apple Pay's `PKPaymentToken` would surface for a receipt display, not
  real card data — FundRage never touches money or card details directly (CLAUDE.md §1). Note
  the file is `receiptsData.ts`, not `receipts.ts` — the latter collides with `Receipts.tsx` on
  macOS's case-insensitive filesystem.
- `src/screens/Donate/` — the final piece of the demo flow, closing the loop:
  Feed → Article → Nonprofits → **Donate** → **DonationSuccess** → back to Feed, with a new
  entry appended to Donation Receipts. Built from Figma's "Donate" frame (31:1438): nonprofit
  name, $5/$10/$25 preset amounts (reusing the same check-badge selected-state asset as
  Topics/Sources) plus a custom-amount field, and a "More Details" box with a mocked Charity
  Navigator rating and a disabled "Visit Website" button (no real per-nonprofit site exists in
  `nonprofits.ts`, same reasoning as Account's non-functional FAQs/User Agreement rows).
  Deliberately does **not** add any payment/card-entry step after it — the Figma frame itself
  only ever collects an amount, and in the real app Next would hand off to an Every.org Donate
  Link (or Apple Pay via their flow); the actual charge happens entirely outside FundRage, with
  confirmation arriving later via their webhook (CLAUDE.md §1). Building a fake "enter your
  card" screen here would be a demo pattern that can't be replicated once this connects to a
  real backend, so `DonationSuccess` (reusing Welcome's trophy/confetti illustration) appears
  immediately after Next instead, and `App.tsx` appends a receipt to the `receipts` state at
  that point as if Every.org's webhook had already confirmed it — since there's no real backend
  here to actually wait on.
- **Editing existing topics/sources from Settings** reuses `TopicSelection` and
  `SourceSelection` rather than duplicating them — both gained optional `initialSelectedIds`,
  `title`, and `nextLabel` props so the same photo-grid / list-select UI can pre-check an
  existing selection and show "Save" instead of "Next (n)" when opened from Account.

## Known gaps / things to reconcile before this touches a real backend

- **The demo's core direction (declared sources → in-app feed) may conflict with the product
  docs** — see the warning above. This is the biggest open item.
- **Three different topic lists now exist** and none match each other: the original
  icon-based screen (21 topics), this photo-based screen (20 topics), and the 30 topics
  seeded in `supabase/migrations/20260708000002_seed_topics.sql`. Needs an owner decision on
  which is authoritative before this connects to a real backend.
- **Skip and "Log in here" both jump straight to Create Account** — bypassing Topics, Sources,
  and Welcome entirely. There's no separate login screen in this demo, so "Log in here" reuses
  the same Sign in with Apple screen a new signup would use; Skip is treated the same way, since
  skipping the onboarding carousel and going straight to sign up is the closest equivalent this
  demo has. This required adding a `backTo` field to the `createAccount` Step so Back can return
  to the right place (the same onboarding step you skipped from, vs. Welcome in the normal
  Topics → Sources → Welcome → Create Account path). One consequence: since Skip/Log in don't
  collect topics/sources, a user who takes that path reaches an empty Feed ("No matching stories
  yet") — there's no real account behind any of this to have saved prior preferences to log back
  into.
- **Topics no longer needs its own mood** — it's hardcoded to `mood="angry"` since there's still
  no mood-capture screen between Onboarding and Topics; the header text ("What's making you
  angry?") reads a little oddly following straight from Onboarding3's "Fundrage" step until that
  screen exists.
- **Sign Out and Delete Your Account are both mocked identically** — there's no real session to
  end, so both just reset `App.tsx` back to the first Onboarding step (Delete also clears the
  saved profile/topics/sources). A real implementation would need a confirmation-then-API-call
  distinction between the two.
- **Account is reachable from every signed-in screen's header profile icon** — Feed, Article
  Detail, and Nonprofits all wire `ScreenHeader`'s `onProfileClick` to open Account. Topics and
  Sources deliberately don't: `showProfileIcon={false}` there instead of a dead icon, since those
  screens run both pre-signup (onboarding, no account exists yet) and from Settings' "edit"
  actions (where Back already returns straight to Account). Earlier, `onProfileClick` was only
  wired on Feed, so the icon rendered but did nothing on every other screen — easy to mistake
  for "Account isn't built" when it's really "the icon isn't a button here."
