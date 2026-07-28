# FundRage — Brand Style Guide

Extracted from the Figma file **FundRage — Branding**
(`https://www.figma.com/design/wLWiYnwxIwzV8tDropy7et/FundRage---Branding`).

## Pages

| Page       | Contents                                                          | Included below        |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| Final Logo | Logo lockups (square, wide, alt, icon-only, talk-bubble variants) | Colors only (no text) |
| Colors     | Color palette reference sheet                                     | Yes                   |
| Typeface   | Type specimen sheets (Barlow Condensed, Barlow)                   | Yes                   |

Other pages in the file are unfinished concepts/explorations and are intentionally excluded.

---

## Colors

### Palette (from the Colors page)

**Rage (Coral)**

| Token             | Hex       |
| ----------------- | --------- |
| Rage500           | `#5C0000` |
| Rage400           | `#990000` |
| Rage300           | `#D60000` |
| Rage200 (Primary) | `#FF5C5C` |
| Rage100           | `#FFEBEB` |

**Aqua**

| Token             | Hex       |
| ----------------- | --------- |
| Aqua500           | `#194D48` |
| Aqua400           | `#309189` |
| Aqua300           | `#47C2B8` |
| Aqua200 (Primary) | `#85D6CF` |
| Aqua100           | `#E8F7F6` |

**Navy**

| Token             | Hex       |
| ----------------- | --------- |
| Navy500 (Primary) | `#294056` |
| Navy400           | `#42668A` |
| Navy300           | `#648CB4` |
| Navy200           | `#98B3CD` |
| Navy100           | `#DDE6EE` |

**Purple (Lilac)**

| Token               | Hex       |
| ------------------- | --------- |
| Purple500           | `#30246B` |
| Purple400           | `#523DB8` |
| Purple300 (Primary) | `#9285D6` |
| Purple200           | `#C2BAE8` |
| Purple100           | `#EEECF9` |

**Mist**

| Token             | Hex       |
| ----------------- | --------- |
| Mist500           | `#33374C` |
| Mist400           | `#757DA3` |
| Mist300           | `#A3A8C2` |
| Mist200 (Primary) | `#D1D4E0` |
| Mist100           | `#F0F1F5` |

**Neutrals**

| Token | Hex                                         |
| ----- | ------------------------------------------- |
| White | `#FFFFFF`                                   |
| Black | `#101010` (text/borders), `#000000` (fills) |

> Note: each color family's "Primary" sits at a different tier in its own scale (Rage/Aqua/Mist = tier 200, Navy = tier 500, Purple = tier 300) — that's intentional tokenization, not an error.

> ⚠️ Known issue: the "Secondary" swatches on the Colors page are labeled `E1185B` and `D1C21F`, but their actual fills are plain white and black. The text labels are stale and don't match the applied color — worth fixing in Figma before treating those two hex values as real brand colors.

### Colors used in Final Logo

Only two colors are actually applied across every logo lockup:

| Token             | Hex       |
| ----------------- | --------- |
| Rage200 (Primary) | `#FF5C5C` |
| White             | `#FFFFFF` |

---

## Typography

Two type families are documented on the Typeface page. No named/shared Figma text styles exist in this file — every specimen is a manually-styled text layer, so the values below are read directly off each layer's font, size, and tracking.

### Barlow Condensed

Weights available: Thin, Light, Regular, Bold, ExtraBold, Black — each with an italic variant (12 styles total).

| Specimen                         | Font / Weight             | Size | Notes                                             |
| -------------------------------- | ------------------------- | ---- | ------------------------------------------------- |
| Type name heading                | Barlow Condensed Light    | 72px | tracking -0.5px                                   |
| Large body / pull quote          | Barlow Condensed Regular  | 48px |                                                   |
| Secondary body                   | Barlow Condensed Light    | 18px |                                                   |
| Emphasis paragraph               | Barlow Condensed Bold     | 24px |                                                   |
| Display quote                    | Barlow Condensed Black    | 72px |                                                   |
| Background/decorative type       | Barlow Condensed Light    | 36px | low opacity                                       |
| Background/decorative type (alt) | Barlow Condensed Bold     | 60px | low opacity                                       |
| Weight/style labels              | Barlow Condensed [weight] | 12px | tracking -0.2px, used for each specimen's caption |

### Barlow

Same structure and weight set as Barlow Condensed: Thin, Light, Regular, Bold, ExtraBold, Black, each with italic (12 styles total).

| Specimen                         | Font / Weight   | Size | Notes           |
| -------------------------------- | --------------- | ---- | --------------- |
| Type name heading                | Barlow Light    | 72px | tracking -0.5px |
| Large body / pull quote          | Barlow Regular  | 48px |                 |
| Secondary body                   | Barlow Light    | 18px |                 |
| Emphasis paragraph               | Barlow Bold     | 24px |                 |
| Display quote                    | Barlow Black    | 72px |                 |
| Background/decorative type       | Barlow Light    | 36px | low opacity     |
| Background/decorative type (alt) | Barlow Bold     | 60px | low opacity     |
| Weight/style labels              | Barlow [weight] | 12px | tracking -0.2px |

> ⚠️ Known issue: on this frame, every weight-label caption reads "Barlow Condensed [weight]" even though the applied font is actually plain **Barlow** (not Condensed). The layer names/text are stale copy-paste from the other frame — the font-family values above are the real ones, taken from each layer's actual font assignment, not its caption text.

### Eyebrow / section label

| Specimen                | Font / Weight         | Size | Notes                                                                 |
| ----------------------- | --------------------- | ---- | --------------------------------------------------------------------- |
| "Primary / Digital" tag | Source Sans Pro Black | 10px | tracking 3px, uppercase — appears identically on both Typeface frames |
