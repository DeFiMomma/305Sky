# Visual Identity — black, gold, ivory, with a bit of mystery

Every post must look like it came from the same house as the 305 SKY location pages
(`website/*.html` on branch `claude/vibrant-noether-yct8df`). The working Instagram mockup lives in
`marketing/instagram-grid/index.html`. Reuse its tokens and tile templates when producing designs.

## Tokens (identical to the location pages)
| Token | Value | Use |
|---|---|---|
| Black | `#0a0a0a` (panels `#111111`, `#161616`) | Dark backgrounds |
| Ivory | `#ece6d9` | Light backgrounds, headline text on dark |
| Ink | `#121110` | Headline text on ivory |
| Gold | `#c9a45c`; soft `#e3c98d`; deep `#8a6a2e` (for gold on ivory) | Labels, hairlines, corners |
| Gold gradient | `linear-gradient(115deg,#f4e2a8 0%,#d6b26a 32%,#a87b34 62%,#e9cf8c 100%)` | One word or number per post, never a whole background |
| Hairline | `rgba(201,164,92,.22)` / strong `.45` | Rules and frames |

Type: **Cormorant Garamond** Light (300) for headlines, one word in *italic* (often gold) ·
**Jost** 400 in spaced capitals (letter-spacing ≈ .28–.32em) for eyebrows/labels · body Jost 300.
Max ~8 words on a cover. No other fonts, no bold display faces, no emoji on designed tiles.

## Signature devices (from the site)
- Eyebrow: short gold line + spaced capitals ("— RETURN TO SERVICE").
- Framed corners: two thin gold L-corners (top-left, bottom-right) on type tiles.
- Gold-lit backdrop: radial gold glow on near-black when there's no photo.
- Airport codes as chips: `FLL · FXE · BCT · VRB` in thin gold-bordered boxes.
- Big serif numerals in gold gradient for stats (`55+`, `12,000+`, `2019`).

## Photo grading — where the mystery lives
Low-key and warm: exposure down (~-0.5 to -1 EV), contrast up, saturation down (~-25%), a touch of warmth,
soft vignette, shadows near black. Light should fall on the subject: a jet at dusk, a lit logo, hands on a panel,
a hangar door half open. Shoot golden hour, blue hour and night; crop tight; leave negative space for type.
Avoid: midday flat light, cluttered ramp backgrounds, people mid-blink, visible tail numbers (blur/crop unless approved).

## Instagram grid
Profile grid previews at **3:4**; feed posts are **4:5 (1080×1350)**; Reels 9:16 with the cover designed to the 3:4 crop.
Three tested options (see mockup):
- **A · Checkerboard (recommended):** alternate dark and ivory every post. Rule of thumb: *dark = image, ivory = words.*
  With 3 columns this always forms a checkerboard, and an archived post only flips the pattern.
- **B · Bands:** rows of three alternate dark/ivory. Striking but must be posted in sets of three.
- **C · Noir:** all dark. Most mysterious, but heavy and lower contrast.
**Chosen by the owner on 2026-10-09: Option A, Checkerboard.** Note the tone (Dark/Ivory) of every post in the calendar.
Refinements: ivory tiles are mostly words but may hold a framed photo for variety; Reels covers follow their slot's tone;
when a post is archived, re-check that the newest 3 rows still alternate.

## Post templates
| Template | Tone | Layout |
|---|---|---|
| Dark photo | Dark | Full-bleed graded photo, bottom gradient, small light logo top-left, gold eyebrow + ivory serif headline bottom-left |
| Ivory type | Ivory | Ivory paper, ink headline with one gold-deep italic word, gold-deep eyebrow, framed corners, hairline at bottom |
| Dark type | Dark | Near-black with gold glow, framed corners, ivory headline with one gold-gradient word |
| Stat | Either | Giant serif number (gold gradient on dark / gold-deep on ivory), spaced-caps label |
| Codes | Either | Headline + airport code chips |
| Ivory framed photo | Ivory | Photo inset in an ivory passe-partout, caption beneath like a gallery print (Option B rows) |
Carousel interiors keep the cover's tone; alternate photo slides and text slides; last slide = logo + CTA.

## Logo
Light version on dark, standard on ivory; small (≈ 20% of tile width), top-left or bottom corner; never over livery,
never as a tiled watermark. The palm + "305 Sky" mark can appear lit (as on the lobby wall) as a hero subject.

## Facebook & LinkedIn
Same templates at 4:5 or 1:1. LinkedIn document carousels use the ivory type template for text pages and dark photo
pages between them. Cover/banner images: dark photo template, wide crop, logo left, one line of serif type.

## Lessons from the current feed (@305skymaintenance, reviewed 2026-10-09)
Keep: black + gold base, real photography (Challenger at sunset, leather cabin, techs on the King Air, Garmin panel),
light serif headlines, the 15-year-client testimonial. Change:
- No heavy condensed all-caps headlines ("GROUNDED?", "WE'RE HIRING!") — they read promotional, not elite.
- No www.305sky.com box or large centered logo on every tile; website lives in the bio.
- No paragraphs on the image; ≤ 8 words, detail goes in the caption.
- No globe icons, phone mockups or stock-style renders.
- Blur tail numbers (N604XT was readable on a past post).
The grid studio (`marketing/instagram-grid/index.html`, published at https://claude.ai/artifact/5qxY29js1RNXX4cK8SYZr3)
shows the current feed beside options A/B/C and lets the owner edit posts.
